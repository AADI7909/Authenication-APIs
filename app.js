const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const path = require('path')
const dbpath = path.join(__dirname, 'userData.db')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}
initializeDBAndServer()

// API 1
app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = "${username}"`
  const dbgetresponse = await db.get(selectUserQuery)
  if (dbgetresponse === undefined) {
    const passwordlength = password.length
    if (passwordlength > 5) {
      const hashedpassword = bcrypt.hash(request.body.password, 10)
      const CreateUserQuery = `INSERT INTO user
                              (username,name,password,gender,location)
                              VALUES (
                                "${username}",
                                "${name}",
                                "${hashedpassword}",
                                "${gender}",
                                "${location}"
                              )`
      const dbrunResponse = await db.get(CreateUserQuery)
      response.send('User created successfully')
    } else {
      response.status(400)
      response.send('Password is too short')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

// API 2
app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched === true) {
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})
