import express from 'express'
import connectDatabase from './config/db'
import { check, validationResult } from 'express-validator'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'
import User from './models/User'
import Media from './models/Media'
import auth from './middleware/auth'
import path from 'path'

// Initialize express application
const app = express()

//Connect database
connectDatabase()

//Configure Middleware
app.use(express.json({ extended: false }))
app.use(
    cors({
        origin: 'http://localhost:3000'
    })
)

// API endpoints

/**
 * @route POST api/users
 * @desc Register user
 */
app.post(
    '/api/users', 
    [
        check('name', 'Please enter your name')
            .not()
            .isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check(
            'password', 
            'Please enter a password with 6 or more characters'
            ).isLength({ min: 6})
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        } else {
            const { name, email, password} = req.body
            try {
                //Check if user exists
                let user = await User.findOne({ email: email })
                if (user) {
                    return res
                        .status(400)
                        .json({ errors: [{ msg: 'User already exists'}] })
                }

                //Create a new user
                user = new User({
                    name: name,
                    email: email,
                    password: password
                })

                //Encrypt the password
                const salt = await bcrypt.genSalt(10)
                user.password = await bcrypt.hash(password, salt)

                //Save to the db and return
                await user.save()

                // Generate and return a JWT token
                returnToken(user, res)
            } catch (error) {
                res.status(500).send('Server error')
            }
        }
    }
)

/**
 * @route GET api/auth
 * @desc Authenticate user
 */
app.get('/api/auth', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Unknown server error')
    }
})

/**
 * @route POST api/login
 * @desc Login user
 */
app.post(
    '/api/login', 
    [
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'A password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        } else {
            const { email, password } = req.body
            try {
                //Check if user exists
                let user = await User.findOne({ email: email })
                if (!user) {
                    return res
                        .status(400)
                        .json({ errors: [{ msg: 'Invalid email or password' }] })
                }
                
                //Check password
                const match = await bcrypt.compare(password, user.password)
                if (!match) {
                    return res
                        .status(400)
                        .json({ errors: [{ msg: 'Invalid email or password' }] })
                }

                //Generate and return a JWT token
                returnToken(user, res)
            } catch (error) {
                res.status(500).send('Server error')
            }
        }
})

/**
 * @route POST api/medias
 * @desc Create media
 */
app.post(
    '/api/medias',
    [
        auth,
        [
            check('title', 'Title text is required')
                .not()
                .isEmpty(),
            check('creator', 'Creator text is required')
                .not()
                .isEmpty(),
            check('type', 'Type text is required')
                .not()
                .isEmpty(),
            check('units', 'Unit text is required')
                .not()
                .isEmpty(),
            check('progress', 'Progress text is required')
                .not()
                .isEmpty(),
            check('unitType', 'Type text is required')
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: error.array() })
        } else {
            const { title, creator, type, units, progress, unitType  } = req.body
            try {
                //Get the user who created the post
                const user = await User.findById(req.user.id)

                //Create a new post
                const mediaItem = new Media({
                    user: user.id,
                    title: title,
                    creator: creator,
                    type: type,
                    units: units,
                    progress: progress,
                    unitType: unitType 
                })

                //Save to the db and return
                await mediaItem.save()

                res.json(mediaItem)
            } catch (error) {
                console.error(error)
                res.status(500).send('Server error')
            }
        }
    }
)

/**
 * @route GET api/media
 * @desc Get medias
 */
app.get('/api/medias', auth, async (req, res) => {
    try {
        const medias = await Media.find()

        res.json(medias)
    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
})

app.get('/api/medias/:id', auth, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id)

        //Make sure the media item was found
        if (!mediaItem) {
            return res.status(404).json({ mag: 'Media not found' })
        }

        res.json(mediaItem)
    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
})
/**
 * @route DELETE api/medias/:id
 * @desc Delete a media
 */
app.delete('/api/medias/:id', auth, async (req, res) => {
    try {
        const mediaItem = await Media.findById(req.params.id)

        //Make sure the post was found
        if (!mediaItem) {
            return res.status(404).json({ msg: 'Media not found '})
        }

        //Make sure the request user created the post
        if (mediaItem.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' })
        }

        await mediaItem.remove()

        res.json({ msg: 'Media removed' })
    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
})

app.put('/api/medias/:id', auth, async (req, res) => {
    try {
        const { title, creator, type, units, progress, unitType } = req.body
        const mediaItem = await Media.findById(req.params.id)

        //Make sure the post was found
        if (!mediaItem) {
            return res.status(404).json({ msg: 'Media not found '})
        }

        //Make sure the request user created the post
        if (mediaItem.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' })
        }

        //Update the media item and return
        mediaItem.title = title || mediaItem.title
        mediaItem.creator = creator || mediaItem.creator
        mediaItem.type = type || mediaItem.type
        mediaItem.units = units || mediaItem.units
        mediaItem.progress = progress || mediaItem.progress
        mediaItem.unitType = unitType || mediaItem.unitType

        await mediaItem.save()

        res.json(pomediaItemst)
    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
})

const returnToken = (user, res) => {
    const payload = {
        user: {
            id: user.id
        }
    }

    jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '10hr' },
        (err, token) => {
            if (err) throw err
            res.json({ token: token })
        }
    )
}

// Serve build files in production
if (process.env.NODE_ENV === 'production') {
    // Set the build folder
    app.use(express.static('client/build'))

    //Route all requests to serve up the built index file
    // (i.e., [current working directory]/client/build/index.html)
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}


// Connection listener

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Express server running on port ${port}`))