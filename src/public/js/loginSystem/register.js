const name_input = document.getElementById('name')
const lastname_input = document.getElementById('lastname')
const email_input = document.getElementById('email')
const age_input = document.getElementById('age')
const password_input = document.getElementById('password')
const registerButton = document.getElementById('registerButton')

registerButton.addEventListener('click', async (e) => {
  e.preventDefault()
  const name = name_input.value
  const lastname = lastname_input.value
  const email = email_input.value
  const age = age_input.value
  const password = password_input.value

  const response = await fetch('/api/sessions/register', {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      name, lastname, email, age, password
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json()

  response.ok
    ? Swal.fire({
      title: 'Success',
      text: 'The user registered successfully!',
      icon: 'success',
      didClose: () => {
          window.location.href = '/';
      }
    })
    : Swal.fire({
      title: 'Error',
      text: `${data}!`,
      icon: 'error',
    });
})