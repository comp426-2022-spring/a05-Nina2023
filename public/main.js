// Focus div based on nav button click
const home = document.getElementById('homenav')
home.addEventListener('click', hideDivs)
function hideDivs() {
    document.getElementById('single').setAttribute('class', 'hidden')
    document.getElementById('multi').setAttribute('class', 'hidden')
    document.getElementById('guess').setAttribute('class', 'hidden')
}


// Flip one coin and show coin image to match result when button clicked
const single = document.getElementById('singlenav')
single.addEventListener('click', flipCoin)
async function flipCoin(event) {
    event.preventDefault()
    hideDivs()

    const url = document.baseURI + 'app/flip/'
    const flip = await fetch(url).then(function(response) {
        return response.json()
    })

    console.log(flip)
    document.getElementById('singleresult').innerHTML = flip.flip
    document.getElementById('coin').setAttribute('src', 'assets/img/' + flip.flip + '.png')
    document.getElementById('single').setAttribute('class', 'active')
}


// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series
const multi = document.getElementById('multinav')
multi.addEventListener('click', showMulti)
function showMulti() {
    hideDivs()
    document.getElementById('multi').setAttribute('class', 'active')
}

const coinsForm = document.getElementById('coins')
coinsForm.addEventListener('submit', flipCoins)

async function flipCoins(event) {
    event.preventDefault()

    const url = document.baseURI + 'app/flip/coins/'

    try {
        const formData = new FormData(event.currentTarget)
        const formDataJson = JSON.stringify(Object.fromEntries(formData))
        const options = {
            method: "POST",
            headers: {"Content-Type": 'application/json', Accept: 'application/json'},
            body: formDataJson
        }

        const flips = await fetch(url, options).then(function(response) {
            return response.json()
        })
        
        console.log(flips)
        document.getElementById('multiresult').setAttribute('class', 'visible')
        document.getElementById('multiresult').innerHTML = `
        <p>Result: ` + JSON.stringify(flips.summary) +`</p>
        `
        // make table
        document.getElementById('multiresult').innerHTML += `
        <th scope="col">Result</th><th scope="col">Coin</th>
        `
        for (var i = 0; i < flips.raw.length; i++) {
            document.getElementById('multiresult').innerHTML += `
            <tr>
                <td style="text-align:center">` + flips.raw[i] + `</td><td><img class="smallcoin" src="assets/img/` + flips.raw[i] + `.png"></img></td>
            </tr>
            `
        }
    } catch (error) {
        console.log(error)
    }
}


// Guess a flip by clicking either heads or tails button
const guess = document.getElementById('guessnav')
guess.addEventListener('click', showGuess)
function showGuess() {
    hideDivs()
    document.getElementById('guess').setAttribute('class', 'active')
}

const guessForm = document.getElementById('call')
guessForm.addEventListener('submit', guessCoin)

async function guessCoin(event) {
    event.preventDefault()

    const url = document.baseURI + 'app/flip/call/'

    try {
        const formData = new FormData(event.currentTarget)
        const formDataJson = Object.fromEntries(formData)
        var input
        if (parseInt(formDataJson.input) == 1) {
            input = JSON.stringify({ 'guess': 'tails' })
        } else {
            input = JSON.stringify({ 'guess': 'heads'})
        }
        const options = {
            method: "POST",
            headers: {"Content-Type": 'application/json', Accept: 'application/json'},
            body: input
        }

        const result = await fetch(url, options).then(function(response) {
            return response.json()
        })

        console.log(result)
        document.getElementById('guessresult').setAttribute('class', 'visible')
        if (result.result == 'win') {
            document.getElementById('guessresult').innerHTML = `
            <p>Result: ` + result.flip +`</p>
            <p><span style="color:purple">YOU WIN! :)</span></p>
            `
        } else {
            document.getElementById('guessresult').innerHTML = `
            <p>Result: ` + result.flip + `</p>
            <p><span style="color:purple">you lose :(</span></p>
            `
        }
        
    } catch(error) {
        console.log(error)
    }
}

// Art by Joan Stark
//                     __
//          .,-;-;-,. /'_\
//        _/_/_/_|_\_\) /
//      '-<_><_><_><_>=/\
// jgs    `/_/====/_/-'\_\
//         ""     ""    ""