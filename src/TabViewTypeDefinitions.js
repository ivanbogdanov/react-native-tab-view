/* @flow */

import { Animated } from 'react-native';

export type Route = {
  key: string;
  title?: string;
  testID?: string;
}

export type NavigationState = {
  index: number;
  routes: Array<Route>;
}

export type Scene = {
  route: Route;
  focused: boolean;
  index: number;
}

export type Layout = {
  height: number;
  width: number;
}

export type PagerProps = {
  layout: Layout & {
    measured: boolean;
  };
  navigationState: NavigationState;
  progress: Animated.Value;
  offset: Animated.Value;
  jumpToIndex: (index: number) => void;
}

export type SceneRendererProps = {
  layout: Layout & {
    measured: boolean;
  };
  navigationState: NavigationState;
  position: Animated.Value;
  jumpToIndex: (index: number) => void;
}
