import { box } from '@opentscad/core';

/**
 * An assembly example showing how to combine multiple components.
 * 
 * This demonstrates organizing complex models by composing
 * simpler components together.
 */

// Import our bracket component
import bracket from '../components/bracket.model.js';

export default function simpleAssembly() {
  // Create different sized brackets
  const largeBracket = bracket({
    width: 80,
    height: 50,
    thickness: 10
  });

  const smallBracket = bracket({
    width: 40,
    height: 25,
    thickness: 6
  });

  // For now, just return the large bracket
  // In the full implementation, this would position and combine multiple parts
  return largeBracket;
}