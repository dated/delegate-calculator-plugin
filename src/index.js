module.exports = {
  register () {
    this.routes = [
      {
        path: '/calculator',
        name: 'calculator',
        component: 'Calculator'
      }
    ]

    this.menuItems = [
      {
        routeName: 'calculator',
        title: 'ARK Delegate Calculator'
      }
    ]
  },

  getComponentPaths () {
    return {
      'Calculator': 'pages/index.js'
    }
  },

  getRoutes () {
    return this.routes
  },

  getMenuItems () {
    return this.menuItems
  }
}
