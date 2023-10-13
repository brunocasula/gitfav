export { Favorites, FavoritesView }

import { githubUser } from "./github.user.js"

// classe que vai conter a lógica dos dados
// como os dados serão estruturados
class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-gitfav:')) || []
  }

  save() {
    localStorage.setItem("@github-gitfav:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase())

      if (userExists) {
        throw new Error('Usuário já cadastrado!')
      }

      const user = await githubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save();

    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry =>
      entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save();
  }
}


// classe que vai criar a visualização eventos do HTML
class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {

    const addButton = this.root.querySelector('.search button');

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input');

      this.add(value)
    }

    this.root.querySelector('.search input').addEventListener('keypress', (event) => {

      if (event.key === 'Enter') {
        const { value } = this.root.querySelector('.search input');

        this.add(value)
      }

    })
  }

  update() {
    this.removeAlltr()

    if (this.entries.length === 0) {
      const row = this.createRowEmpty()

      this.tbody.append(row)

      return
    }

    this.root.querySelector('.search input').value = '';

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user a p').textContent = user.name
      row.querySelector('.user a span').textContent = user.login

      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOK = confirm('Tem certeza que deseja deletar essa linha?')

        if (isOK) {
          this.delete(user)
        }
      }
      this.tbody.append(row)
    })

  }

  createRow() {
    let tr = document.createElement('tr')

    tr.innerHTML =
      `
        <tr>
          <td class="user">
            <span>
              <img src="https://github.com/brunocasula.png" alt="Imagem de brunocasula">
              <a href="https://github.com/brunocasula" target="_blank">
                <p>Bruno Casula</p>
                <span>brunocasula</span>
              </a>
            <span>
          </td>
          <td class="repositories">
            76
          </td>
          <td class="followers">
            9589
          </td>
          <td class="action">
            <button class="remove">Remover</button>
          </td>
        </tr>
      `
    return tr
  }

  createRowEmpty() {
    const tr = document.createElement('tr');

    tr.classList.add("none-wrapper")

    tr.innerHTML =
      `
      <tr class="none-wrapper">
        <td colspan="4">
          <span class="none-favorite">
            <img src="./img/Estrela.svg" alt="">
            <span>Nenhum favorito ainda</span>
          </span>
        </td>
      </tr>
      `
    return tr
  }

  removeAlltr() {
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })
  }


}