# PCF Text Formatter Sample

This sample Power Apps Component Framework (PCF) control formats a bound Single Line Text field in a model-driven app.

## Features
- Displays a text input bound to the field value
- Provides buttons for Uppercase, Lowercase, and Title Case formatting
- Updates the bound field value immediately when formatting is applied

## Files
- `src/index.ts` - control logic
- `src/ControlManifest.Input.xml` - PCF control manifest
- `typings/pcf.d.ts` - minimal PCF type definitions for local compile
- `tsconfig.json` - TypeScript configuration
- `pcfconfig.json` - sample PCF project metadata

## Build
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the control:
   ```bash
   npm run build
   ```

## Deploy
Use the Power Apps CLI (`pac pcf push` or `pac pcf init`) or import the compiled control into a model-driven app solution.
