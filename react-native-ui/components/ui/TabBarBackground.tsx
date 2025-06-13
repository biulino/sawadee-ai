// This is a shim for web and Android where the tab bar is generally opaque.
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default undefined;

export function useBottomTabOverflow() {
  const { bottom } = useSafeAreaInsets();
  return bottom;
}
