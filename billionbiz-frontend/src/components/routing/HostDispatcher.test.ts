import React from 'react';
import { describe, expect, it } from 'vitest';
import { Route } from 'react-router-dom';
import { renderAdminRoutes } from './HostDispatcher';

function assertOnlyRouteChildren(node: React.ReactNode): void {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    const element = child as React.ReactElement<any>;
    expect([Route, React.Fragment]).toContain(element.type);
    if (element.type === React.Fragment) assertOnlyRouteChildren(element.props.children);
  });
}

describe('admin route tree', () => {
  it('returns a valid Route root and never places Suspense directly under Routes', () => {
    const routes = renderAdminRoutes();
    const element = routes as React.ReactElement<any>;
    expect(element.type).toBe(Route);
    assertOnlyRouteChildren(element.props.children);
  });

  it('keeps the theme library and legacy theme link in the admin route table', () => {
    const paths: string[] = [];
    const collectPaths = (node: React.ReactNode) => React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;
      const element = child as React.ReactElement<any>;
      if (element.type === Route && typeof element.props.path === 'string') paths.push(element.props.path);
      if (element.type === Route || element.type === React.Fragment) collectPaths(element.props.children);
    });
    collectPaths(renderAdminRoutes());
    expect(paths).toContain('/theme');
    expect(paths).toContain('/online-store/themes');
  });
});
