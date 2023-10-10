class UserDTO {
  constructor(name, lastname, age) {
    this.fullname = `${name}${lastname}`,
    this.age = age
  }
}

module.exports = UserDTO