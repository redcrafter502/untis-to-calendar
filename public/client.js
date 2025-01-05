const onClickCopyElements = document.querySelectorAll('[onclick-copy]')
if (onClickCopyElements.length > 0) {
  onClickCopyElements.forEach((onClickCopyElement) => {
    onClickCopyElement.addEventListener('click', (e) => {
      const copyText = e.currentTarget.getAttribute('onclick-copy')
      navigator.clipboard
        .writeText(copyText)
        .catch((error) =>
          console.error('Error when copying to clipboard', error),
        )
    })
  })
}

const submitConfirmElements = document.querySelectorAll(
  '[submit-delete-confirm]',
)
if (submitConfirmElements.length > 0) {
  submitConfirmElements.forEach((submitConfirmElement) => {
    submitConfirmElement.addEventListener('submit', (e) => {
      if (!confirm('Are you sure you want to delete?')) e.preventDefault()
    })
  })
}

const newPasswordInput = document.getElementById('newPassword')
const newPasswordConfirmedInput = document.getElementById(
  'newPasswordConfirmed',
)

if (newPasswordInput && newPasswordConfirmedInput) {
  ;[newPasswordInput, newPasswordConfirmedInput].forEach((input) => {
    input.addEventListener('change', () => {
      const newPasswordConfirmedInput = document.getElementById(
        'newPasswordConfirmed',
      )
      if (
        newPasswordConfirmedInput.value !==
        document.getElementById('newPassword').value
      ) {
        newPasswordConfirmedInput.setCustomValidity('Passwords must match!')
      } else {
        newPasswordConfirmedInput.setCustomValidity('')
      }
    })
  })
}

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
console.log(timezone)
