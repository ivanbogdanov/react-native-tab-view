/* @flow */

import React, { PureComponent, PropTypes } from 'react';
import {
  Platform,
  View,
  StyleSheet,
} from 'react-native';
import TabViewTransitioner from './TabViewTransitioner';
import { NavigationStatePropType } from './TabViewPropTypes';
import type { Scene, SceneRendererProps } from './TabViewTypeDefinitions';
import type { TransitionerProps } from './TabViewTransitionerTypes';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    overflow: 'hidden',
  },
});

type DefaultProps = {
  renderPager: (props: SceneRendererProps) => React.Element<*>;
}

type Props = TransitionerProps & {
  renderPager: (props: SceneRendererProps) => React.Element<*>;
  renderScene: (props: SceneRendererProps & Scene) => ?React.Element<*>;
  renderHeader?: (props: SceneRendererProps) => ?React.Element<*>;
  renderFooter?: (props: SceneRendererProps) => ?React.Element<*>;
  lazy?: boolean;
}

type State = {
  loaded: Array<number>;
}

let TabViewPager;

switch (Platform.OS) {
case 'android':
  TabViewPager = require('./TabViewPagerAndroid').default;
  break;
case 'ios':
  TabViewPager = require('./TabViewPagerScroll').default;
  break;
default:
  TabViewPager = require('./TabViewPagerPan').default;
  break;
}

export default class TabViewAnimated extends PureComponent<DefaultProps, Props, State> {
  static propTypes = {
    navigationState: NavigationStatePropType.isRequired,
    renderPager: PropTypes.func.isRequired,
    renderScene: PropTypes.func.isRequired,
    renderHeader: PropTypes.func,
    renderFooter: PropTypes.func,
    onChangePosition: PropTypes.func,
    shouldOptimizeUpdates: PropTypes.bool,
    lazy: PropTypes.bool,
  };

  static defaultProps = {
    renderPager: (props: SceneRendererProps, cmp) => {
      return <TabViewPager ref={el => (cmp._pager = el)} {...props}  />
    }
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      loaded: [ this.props.navigationState.index ],
    };
  }

  state: State;

  _pager: Object;

  _renderScene = (props: SceneRendererProps & Scene) => {
    const { renderScene, navigationState, lazy } = this.props;
    const { loaded } = this.state;
    if (lazy) {
      if (loaded.includes(navigationState.routes.indexOf(props.route))) {
        return renderScene(props);
      }
      return null;
    }
    return renderScene(props);
  };

  _renderItems = (props: SceneRendererProps) => {
    const { renderPager, renderHeader, renderFooter } = this.props;
    const { navigationState, layout } = props;
    const currentRoute = navigationState.routes[navigationState.index];

    return (
      <View style={styles.container}>
        {renderHeader && renderHeader(props)}
        {renderPager({
          ...props,
          children: layout.width ? navigationState.routes.map((route, index) => (
            <View key={route.key} style={{ width: layout.width, overflow: 'hidden' }}>
              {this._renderScene({
                ...props,
                route,
                index,
                focused: index === props.navigationState.index,
              })}
            </View>
          )) : (
            <View key={currentRoute.key} style={styles.container}>
              {this._renderScene({
                ...props,
                route: currentRoute,
                index: navigationState.index,
                focused: true,
              })}
            </View>
          ),
        },this)}
        {renderFooter && renderFooter(props)}
      </View>
    );
  };

  _handleChangePosition = (value: number) => {
    const { onChangePosition, navigationState, lazy } = this.props;
    if (onChangePosition) {
      onChangePosition(value);
    }
    const { loaded } = this.state;
    if (lazy) {
      let next = Math.ceil(value);
      if (next === navigationState.index) {
        next = Math.floor(value);
      }
      if (loaded.includes(next)) {
        return;
      }
      this.setState({
        loaded: [ ...loaded, next ],
      });
    }
  };

  getPager() {
    return this._pager
  }

  render() {
    return (
      <TabViewTransitioner
        {...this.props}
        loaded={this.state.loaded}
        onChangePosition={this._handleChangePosition}
        render={this._renderItems}
      />
    );
  }
}
