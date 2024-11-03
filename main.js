(() => {
  function isMatch(text, keyword) {
    function splitKorean(text) {
      const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
      const JUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"
      const JONG = "　ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"

      const splitedArr = text.split('')

      for (let i = splitedArr.length - 1; i >= 0; i--) {
        let num = text.charCodeAt(i)
        if (num >= 0xAC00 && num <= 0xD7A3) {
          num -= 0xAC00
          let curCho = Math.floor(num / JONG.length / JUNG.length)
          let curJung = Math.floor(num / JONG.length % JUNG.length)
          let curJong = num % JONG.length

          let splitedChr

          if (curJong !== 0)
            splitedChr = [CHO[curCho], JUNG[curJung], JONG[curJong]]
          else
          splitedChr = [CHO[curCho], JUNG[curJung]]

          splitedArr.splice(i, 1, ...splitedChr)
        }
      }

      return splitedArr.join('')
    }
    return splitKorean(text.toLowerCase()).includes(splitKorean(keyword.toLowerCase()))
  }

  const input = document.createElement('input')
  input.style =
    `margin: 8px;
    width: 150px;
    height: 24px;
    font-size: 14px;
    border-radius: 12px;
    outline: none;
    border: 0;
    background-color: rgb(220, 220, 220);
    padding: 0 9px;
    font-weight: bold;
    color: #2c313d;`

  let selectedElem = null

  function getElemList() {
    let listElem = input.parentElement
    let scrollbar = listElem.querySelector('div').querySelector('div')

    listElem.prepend(input)

    if (scrollbar && scrollbar.className.includes('scrollbar'))
      listElem = scrollbar.querySelector(".rcs-inner-container")
    else
      scrollbar = null

    return listElem.querySelector("div").children
  }

  function activedNextSibling(elem) {
    elem = elem.nextElementSibling

    while (elem) {
      if (getComputedStyle(elem).display !== 'hidden')
        return elem

      elem = elem.nextElementSibling
    }

    return null
  }

  function activedPrevSibling(elem) {
    elem = elem.previousElementSibling

    while (elem) {
      if (getComputedStyle(elem).display !== 'hidden')
        return elem

      elem = elem.previousElementSibling
    }

    return null
  }

  input.oninput = (e) => {
    const val = e.target.value
    let listElem = e.target.parentElement
    let scrollbar = listElem.querySelector('div').querySelector('div')

    if (scrollbar.className.includes('scrollbar'))
      listElem = scrollbar.querySelector(".rcs-inner-container")
    else
      scrollbar = null

    let list = listElem.querySelector("div").children
    let totalCount = list.length

    let newSelection = false

    if (!val.length) {
      for (let i of list) {
        i.style.display = ''
      }
      changeSelectedElem(list[0])
    }
    else {
      for (let i of list) {
        if (isMatch(i.innerText, val)) {
          if (!newSelection) {
            changeSelectedElem(i)
            newSelection = true
          }
          i.style.display = ''
        }
        else {
          i.style.display = 'none'
          totalCount--
        }
      }

      if (!newSelection)
        changeSelectedElem(null)
    }

    if (scrollbar) {
      const innerListElem = listElem.querySelector("div")
      if (totalCount <= 5) {
        scrollbar.style.height = ''
        listElem.style.marginRight = '-20px'
        innerListElem.style.marginRight = ''

        for (let i of list)
          i.style.marginRight = 'auto'
      }
      else {
        scrollbar.style.height = '260px'
        listElem.style.marginRight = '0px'
        listElem.style.marginRight = '-17px'
        innerListElem.style.marginRight = '0px'

        for (let i of list)
          i.style.marginRight = ''
      }
      listElem.dispatchEvent(new Event('scroll', { bubbles: true }))
    }
  }

  input.onkeydown = (e) => {
    switch (e.code) {
      case 'Enter': {
        selectedElem?.click()
        break
      }
      case 'ArrowDown': {
        let elemList = getElemList()
        let next = activedNextSibling(selectedElem)
        changeSelectedElem(next ?? elemList[0])
        selectedElem.tabIndex = 0
        selectedElem.focus()
        selectedElem.tabIndex = -1
        input.focus()
        break
      }
      case 'ArrowUp': {
        let elemList = getElemList()
        let prev = activedPrevSibling(selectedElem)
        changeSelectedElem(prev ?? elemList[elemList.length - 1])
        selectedElem.tabIndex = 0
        selectedElem.focus()
        selectedElem.tabIndex = -1
        input.focus()
        break
      }
    }
  }

  function changeSelectedElem(elem) {
    if (elem === selectedElem)
      return

    fakeElemNoHover(selectedElem)
    selectedElem = elem
    fakeElemHover(elem)
  }

  function fakeElemNoHover(elem) {
    if (!elem) return
    elem.style.color = '#2c313d'
    elem.style.backgroundColor = '#fff'
    elem.style.borderBottomColor = '#000'
  }

  function fakeElemHover(elem) {
    if (!elem) return
    elem.style.color = '#4f80ff'
    elem.style.backgroundColor = '#ecf8ff'
    elem.style.borderBottomColor = '#4f80ff'
  }

  const _renderOptions = Entry.FieldDropdownDynamic.prototype.renderOptions

  Entry.FieldDropdownDynamic.prototype.renderOptions = function (...args) {
    const ret = _renderOptions.call(this, ...args)

    input.value = ""

    this.dropdownWidget._container.querySelector(".widget > div > div").prepend(input)

    let list = getElemList()

    for (let i of list) {
      i.onmousemove = i.onmouseover = (e) => {
        changeSelectedElem(e.target)
      }
    }

    changeSelectedElem(list[0])
    input.focus()

    return ret
  }

  const _destroyOption = Entry.FieldDropdownDynamic.prototype.destroyOption

  Entry.FieldDropdownDynamic.prototype.destroyOption = function (...args) {
    selectedElem = null
    return _destroyOption.call(this, ...args)
  }
})()