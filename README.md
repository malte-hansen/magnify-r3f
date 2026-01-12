# Magnify R3F

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Real-time optical magnifying glass component for [React Three Fiber](https://github.com/pmndrs/react-three-fiber). Get a high-res zoomed section of your 3D scene with a simple, easy-to-use React component.

## Features

- **Easy to use** - Drop-in React component with sensible defaults
- **Highly customizable** - Control zoom, radius, outline, and glass shape
- **High performance** - Optimized shader-based rendering
- **TypeScript support** - Full type definitions included
- **Touch support** - Works with mouse and touch events
- **Anti-aliasing** - Optional FXAA for smooth edges

## Installation

```bash
npm install @malte-hansen/magnify-r3f
```

## Demo

Check out the [live demo](https://malte-hansen.github.io/magnify-r3f/) to see the magnifying glass in action!

## Quick Start

```tsx
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Magnify } from "@malte-hansen/magnify-r3f";

function App() {
  const [mousePos, setMousePos] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX,
        y: window.innerHeight - e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <Canvas>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial />
      </mesh>

      <Magnify position={mousePos} zoom={3} radius={120} />
    </Canvas>
  );
}
```

## API Reference

### `<Magnify />` Props

| Prop               | Type                               | Default    | Description                                                                                     |
| ------------------ | ---------------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `position`         | `{ x: number, y: number } \| null` | `null`     | Position of the magnifying glass in client coordinates. Set to `null` to disable magnification. |
| `zoom`             | `number`                           | `2.0`      | Zoom factor of the magnifying glass. Range: 1.0 - 15.0                                          |
| `exp`              | `number`                           | `35.0`     | Exponent for calculating the glass shape. Higher values = flatter glass. Range: 1.0 - 100.0     |
| `radius`           | `number`                           | `100.0`    | Radius of the magnifying glass in pixels.                                                       |
| `outlineColor`     | `number`                           | `0xcccccc` | Color of the glass outline (hex value).                                                         |
| `outlineThickness` | `number`                           | `8.0`      | Thickness of the glass outline in pixels. Set to `0` to disable.                                |
| `antialias`        | `boolean`                          | `true`     | Enable FXAA anti-aliasing pass for smoother edges.                                              |
| `enabled`          | `boolean`                          | `true`     | Enable/disable the magnifying effect.                                                           |

## Usage Examples

### Basic Usage

The simplest way to add a magnifying glass to your scene:

```tsx
import { Canvas } from "@react-three/fiber";
import { Magnify } from "@malte-hansen/magnify-r3f";

function Scene() {
  const [mousePos, setMousePos] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: window.innerHeight - e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <Canvas>
      {/* Your 3D scene comes here */}

      {/* Magnifying glass */}
      <Magnify position={mousePos} />
    </Canvas>
  );
}
```

### Properties

Customize the appearance of the magnifying glass:

```tsx
<Magnify position={mousePos} zoom={4} radius={150} exp={50} outlineColor={0xff0000} outlineThickness={10} />
```

## Development

### Running the Demo

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building

```bash
# Build library
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE) © [Amit Diamant](https://github.com/amitdiamant) (refactored and extended by [Malte Hansen](https://github.com/malte-hansen))

## Acknowledgments

- This is a forked project, please also check out the awesome work in the original project: [magnify-3d](https://github.com/amitdiamant/magnify-3d)
- [three.js](https://github.com/mrdoob/three.js) - 3D library
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - React renderer for three.js
- [FXAA Shader](https://github.com/mrdoob/three.js/blob/dev/examples/js/shaders/FXAAShader.js) - Fast approximate anti-aliasing
