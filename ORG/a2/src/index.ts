declare const React: any;
declare const ReactDOM: any;
declare const FluentUIReact: any;

interface IInputs {
  sampleProperty: ComponentFramework.PropertyTypes.StringProperty;
}

interface IOutputs {
  sampleProperty: string | null;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src='${src}']`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load script ${src}`));
    document.head.appendChild(script);
  });
}

function loadStyleNew(href: string): void {
  if (document.querySelector(`link[href='${href}']`)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadReactAssets(): Promise<void> {
  const scriptBase = "https://unpkg.com";
  const reactScript = `${scriptBase}/react@17/umd/react.production.min.js`;
  const reactDomScript = `${scriptBase}/react-dom@17/umd/react-dom.production.min.js`;
  const fluentScript = `${scriptBase}/@fluentui/react@8.116.0/dist/fluentui-react.min.js`;
  const fabricCss = "https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css";

  return Promise.all([loadScript(reactScript), loadScript(reactDomScript), loadScript(fluentScript)]).then(() => {
    loadStyleNew(fabricCss);
  });
}

export class TextFormatterControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container: HTMLDivElement;
  private static _assetsLoaded: Promise<void> | null = null;

  public init(
    context: ComponentFramework.Context<IInputs>,
    _notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this._container = container;
    this._container.innerHTML = "";
    if (!TextFormatterControl._assetsLoaded) {
      TextFormatterControl._assetsLoaded = loadReactAssets();
    }

    TextFormatterControl._assetsLoaded.then(() => {
      this.renderReactComponent(context);
    }).catch(error => {
      console.error(error);
      this._container.textContent = "Unable to load React or Fluent UI libraries.";
    });
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this.renderReactComponent(context);
  }

  public getOutputs(): IOutputs {
    return {
      sampleProperty: null
    };
  }

  public destroy(): void {
    if (typeof ReactDOM !== "undefined") {
      ReactDOM.unmountComponentAtNode(this._container);
    }
  }

  private renderReactComponent(context: ComponentFramework.Context<IInputs>): void {
    if (typeof ReactDOM === "undefined" || typeof React === "undefined" || typeof FluentUIReact === "undefined") {
      return;
    }

    ReactDOM.render(
      React.createElement(ContactGrid, {
        context,
        disabled: context.mode.isControlDisabled
      }),
      this._container
    );
  }
}
