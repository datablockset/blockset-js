import getModule from './get.mjs'
const { get } = getModule

// @ts-ignore
document.getElementById('download').addEventListener('click', () => {
  // @ts-ignore
  const hash = document.getElementById('input').value
  //TODO: call get
  // @ts-ignore
  document.getElementById('output').innerHTML = 'not implemented'
});