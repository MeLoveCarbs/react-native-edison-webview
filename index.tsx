import React, { Component, createRef } from "react";
import WebView, {
  WebViewMessageEvent,
  WebViewProps,
} from "react-native-webview";
import RNFS from "react-native-fs";
import { Buffer } from "buffer";
import Package from "./package.json";

import "./index.html";

const InjectScriptName = {
  SetHTML: "setHTML",
  SetDarkMode: "setDarkMode",
  SetPreviewMode: "setPreviewMode",
} as const;

const EventName = {
  IsMounted: "isMounted",
  OnLoad: "onLoad",
  HeightChange: "heightChange",
  ClickLink: "clickLink",
  Debugger: "debugger",
} as const;

let messageBodyFilePath = `${RNFS.CachesDirectoryPath}/messageBody.html`;
const htmlPath = `file://${RNFS.MainBundlePath}/assets/node_modules/${Package.name}/index.html`;

const copyFile = async () => {
  try {
    const fileHasExists = await RNFS.exists(messageBodyFilePath);
    if (fileHasExists) {
      await RNFS.unlink(messageBodyFilePath);
    }
    await RNFS.copyFile(htmlPath, messageBodyFilePath);
  } catch (err) {
    // badcase remedy
    messageBodyFilePath = htmlPath;
  }
};

copyFile();

export type WebviewEvent = Exclude<
  typeof EventName[keyof typeof EventName],
  typeof EventName["IsMounted"]
>;

type WithoutProps =
  | "ref"
  | "originWhitelist"
  | "source"
  | "allowingReadAccessToURL"
  | "onMessage";
type EdisonWebViewProps = {
  html: string;
  isDrakMode?: boolean;
  isPreviewMode?: boolean;
  onMessage: (type: WebviewEvent, data: any) => void;
} & Omit<WebViewProps, WithoutProps>;

export default class RNWebView extends Component<EdisonWebViewProps> {
  constructor(props: any) {
    super(props);
  }

  private webViewRef = createRef<WebView>();

  componentDidUpdate(prevProps: EdisonWebViewProps) {
    if (prevProps.isDrakMode !== this.props.isDrakMode) {
      this.executeScript(
        InjectScriptName.SetDarkMode,
        String(!!this.props.isDrakMode)
      );
    }
    if (prevProps.isPreviewMode !== this.props.isPreviewMode) {
      this.executeScript(
        InjectScriptName.SetPreviewMode,
        String(!!this.props.isPreviewMode)
      );
    }
    if (prevProps.html !== this.props.html) {
      this.initHtml();
    }
  }

  private executeScript = (
    functionName: typeof InjectScriptName[keyof typeof InjectScriptName],
    parameter?: string
  ) => {
    if (this.webViewRef.current) {
      this.webViewRef.current.injectJavaScript(
        `window.${functionName}(${parameter ? `'${parameter}'` : ""});true;`
      );
    }
  };

  private onMessage = (event: WebViewMessageEvent) => {
    try {
      const messageData: {
        type: typeof EventName[keyof typeof EventName];
        data: any;
      } = JSON.parse(event.nativeEvent.data);
      if (messageData.type === EventName.IsMounted) {
        this.initHtml();
        this.executeScript(
          InjectScriptName.SetDarkMode,
          String(!!this.props.isDrakMode)
        );
        this.executeScript(
          InjectScriptName.SetPreviewMode,
          String(!!this.props.isPreviewMode)
        );
      } else if (this.props.onMessage) {
        this.props.onMessage(messageData.type, messageData.data);
      }
    } catch (err) {
      // pass
    }
  };

  private initHtml = () => {
    const formatHtmlBase64 = Buffer.from(this.props.html, "utf-8").toString(
      "base64"
    );
    this.executeScript(InjectScriptName.SetHTML, formatHtmlBase64);
  };

  render() {
    return (
      <WebView
        {...this.props}
        ref={this.webViewRef}
        originWhitelist={["*"]}
        source={{ uri: messageBodyFilePath }}
        allowingReadAccessToURL={"file://"}
        onMessage={this.onMessage}
      />
    );
  }
}
