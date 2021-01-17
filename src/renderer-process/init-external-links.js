const { shell } = require('electron')

function initExternalLinks() {
  // open external links in default browser instead electron app
  const externalLinks = window.document.querySelectorAll('.external-links a');
  externalLinks.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault()

      if (e.target.nodeName !== 'A') {
        return shell.openExternal(e.target.closest('a').href)
      }

      return shell.openExternal(e.target.href)
    })
  })
}

module.exports = initExternalLinks
