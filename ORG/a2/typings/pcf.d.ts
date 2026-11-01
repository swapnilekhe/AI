declare namespace ComponentFramework {
  interface PropertyTypes {
    StringProperty: {
      raw: string | null;
    };
  }

  interface Context<T> {
    parameters: T;
    mode: {
      isControlDisabled: boolean;
      displayMode: number;
    };
    utils: {
      createGuid(): string;
    };
  }

  interface StandardControl<IInputs, IOutputs> {
    init(context: Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void;
    updateView(context: Context<IInputs>): void;
    getOutputs(): IOutputs;
    destroy(): void;
  }

  interface Dictionary {
    [key: string]: any;
  }
}
