/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */

/**
 * Unit Tests for Advanced Activation Layers.
 */

import {Tensor, tensor1d, tensor2d} from '@tensorflow/tfjs-core';

import * as tfl from '../index';
import {convertPythonicToTs, convertTsToPythonic} from '../utils/serialization_utils';
import {describeMathCPU, describeMathCPUAndGPU, expectTensorsClose} from '../utils/test_utils';


describeMathCPU('ReLU: Symbolic', () => {
  it('Correct output shape', () => {
    const layer = tfl.layers.reLU({});
    const x = new tfl.SymbolicTensor('float32', [2, 3, 4], null, null, null);
    const y = layer.apply(x) as tfl.SymbolicTensor;
    expect(y.shape).toEqual(x.shape);
  });

  it('Serialization round trip', () => {
    const layer = tfl.layers.reLU({maxValue: 28});
    const pythonicConfig = convertTsToPythonic(layer.getConfig());
    // tslint:disable-next-line:no-any
    const tsConfig = convertPythonicToTs(pythonicConfig) as any;
    const layerPrime = tfl.layers.reLU(tsConfig);
    expect(layerPrime.getConfig().maxValue).toEqual(28);
  });
});

describeMathCPUAndGPU('ReLU: Tensor', () => {
  it('No maxValue', () => {
    const layer = tfl.layers.reLU();
    const x = tensor2d([[-100, -200], [0, 300], [200, 200]]);
    const y = layer.apply(x) as Tensor;
    expectTensorsClose(y, tensor2d([[0, 0], [0, 300], [200, 200]]));
  });

  it('Finite maxValue', () => {
    const layer = tfl.layers.reLU({maxValue: 250});
    const x = tensor1d([-100, -200, 0, 300, 200, 200]);
    const y = layer.apply(x) as Tensor;
    expectTensorsClose(y, tensor1d([0, 0, 0, 250, 200, 200]));
  });
});

describeMathCPU('leakyReLU: Symbolic', () => {
  it('Correct output shape', () => {
    const layer = tfl.layers.leakyReLU({alpha: 0.1});
    const x = new tfl.SymbolicTensor('float32', [2, 3, 4], null, null, null);
    const y = layer.apply(x) as tfl.SymbolicTensor;
    expect(y.shape).toEqual(x.shape);
  });
});

describeMathCPUAndGPU('leakyReLU: Tensor', () => {
  it('alpha = default 0.3', () => {
    const layer = tfl.layers.leakyReLU();
    const x = tensor2d([[-1, -2], [0, 3]], [2, 2]);
    const y = layer.apply(x) as Tensor;
    expectTensorsClose(y, tensor2d([[-0.3, -0.6], [0, 3]], [2, 2]));
  });

  it('alpha = 0.1', () => {
    const layer = tfl.layers.leakyReLU({alpha: 0.1});
    const x = tensor2d([[-1, -2], [0, 3]], [2, 2]);
    const y = layer.apply(x) as Tensor;
    expectTensorsClose(y, tensor2d([[-0.1, -0.2], [0, 3]], [2, 2]));
  });
});

describeMathCPU('PReLU: Symbolic', () => {
  it('Correct output shape', () => {
    const layer = tfl.layers.pReLU({alpha: 0.1});
    const x = new tfl.SymbolicTensor('float32', [1, 3, 4], null, null, null);
    const y = layer.apply(x) as tfl.SymbolicTensor;
    expect(y.shape).toEqual(x.shape);
  });
});

describeMathCPUAndGPU('PReLU: Tensor', () => {
  it('alpha = zeros', () => {
    const layer = tfl.layers.pReLU({alpha: 0});
    const x = tensor1d([-1, 2, -3, 4]);
    const y = layer.apply(x) as Tensor;
    expectTensorsClose(y, tensor1d([0, 2, 0, 4]));
  });

  it('alpha = 0.3', () => {
    const layer = tfl.layers.pReLU({alpha: 0.3});
    const x = tensor1d([-1, 2, -3, 4]);
    const y = layer.apply(x) as Tensor;
    expectTensorsClose(y, tensor1d([-0.3, 2, -0.9, 4]));
  });
});

describeMathCPU('elu: Symbolic', () => {
  it('Correct output shape', () => {
    const layer = tfl.layers.elu();
    const x = new tfl.SymbolicTensor('float32', [2, 3, 4], null, null, null);
    const y = layer.apply(x) as tfl.SymbolicTensor;
    expect(y.shape).toEqual(x.shape);
  });
});

describeMathCPUAndGPU('elu: Tensor', () => {
  it('alpha = default 1.0', () => {
    const layer = tfl.layers.elu({});
    const x = tensor2d([[-1, -2], [0, 3]], [2, 2]);
    const y = layer.apply(x) as Tensor;
    expectTensorsClose(
        y, tensor2d([[Math.exp(-1) - 1, Math.exp(-2) - 1], [0, 3]], [2, 2]));
  });
});

describeMathCPU('thresholdedReLU: Symbolic', () => {
  it('Correct output shape', () => {
    const layer = tfl.layers.thresholdedReLU();
    const x = new tfl.SymbolicTensor('float32', [2, 3, 4], null, null, null);
    const y = layer.apply(x) as tfl.SymbolicTensor;
    expect(y.shape).toEqual(x.shape);
  });
});

describeMathCPUAndGPU('thresholdedReLU: Tensor', () => {
  it('theta = default 1.0', () => {
    const layer = tfl.layers.thresholdedReLU({});
    const x = tensor2d([[-1, 0], [1, 3]], [2, 2]);
    const y = layer.apply(x) as Tensor;
    expectTensorsClose(y, tensor2d([[0, 0], [0, 3]], [2, 2]));
  });
});

describeMathCPU('softmax: Symbolic', () => {
  const axisValues = [0, 1, 2, -1, null];
  for (const axis of axisValues) {
    it(`Correct output shape, axis=${axis}`, () => {
      const layer = tfl.layers.softmax({axis});
      const x = new tfl.SymbolicTensor('float32', [2, 3, 4], null, null, null);
      const y = layer.apply(x) as tfl.SymbolicTensor;
      expect(y.shape).toEqual(x.shape);
    });
  }
});

describeMathCPUAndGPU('softmax: Tensor', () => {
  it('theta = default 1.0', () => {
    const layer = tfl.layers.softmax({});
    const x = tensor2d([[0, 1], [5, 5]], [2, 2]);
    const y = layer.apply(x) as Tensor;
    expectTensorsClose(
        y,
        tensor2d(
            [[1 / (1 + Math.E), Math.E / (1 + Math.E)], [0.5, 0.5]], [2, 2]));
  });
});
