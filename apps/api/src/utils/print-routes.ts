import { Express } from 'express'

interface RouteInfo {
  method: string
  path: string
}

function cleanPath(path: string): string {
  return path
    .replace(/\(=\/\|\$\)/g, '') // Remove (=/|$) pattern
    .replace(/\((?:\/|$)\)/g, '') // Remove (?:/|$) pattern
    .replace(/\\/g, '') // Remove escape characters
    .replace(/\(\?=\/\|\)/g, '') // Remove lookahead groups
    .replace(/\?/g, '') // Remove optional markers
    .replace(/^\^|\$$/g, '') // Remove start/end markers
    .replace(/\/+/g, '/') // Replace multiple slashes with single slash
    .replace(/^\/?/, '/') // Ensure path starts with single slash
}

function getRoutesFromLayer(layer: any, baseUrl: string = ''): RouteInfo[] {
  const routes: RouteInfo[] = []

  if (layer.route) {
    const methods = Object.keys(layer.route.methods)
      .filter((method) => layer.route.methods[method])
      .map((method) => method.toUpperCase())

    routes.push({
      method: methods.join(','),
      path: cleanPath(baseUrl + layer.route.path),
    })
  } else if (layer.name === 'router') {
    const routerPath =
      layer.regexp.source === '^\\/?(?=\\/|$)' ? '' : cleanPath(layer.regexp.source)

    layer.handle.stack.forEach((stackItem: any) => {
      const nestedRoutes = getRoutesFromLayer(stackItem, routerPath)
      routes.push(...nestedRoutes)
    })
  }

  return routes
}

export default function getRoutes(app: Express): RouteInfo[] {
  const routes: RouteInfo[] = []

  app._router.stack.forEach((middleware: any) => {
    const middlewareRoutes = getRoutesFromLayer(middleware)
    routes.push(...middlewareRoutes)
  })

  // Sort routes by path
  return routes.sort((a, b) => a.path.localeCompare(b.path))
}
