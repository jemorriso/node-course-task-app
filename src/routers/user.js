const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');
const router = new express.Router();



router.post('/users', async (req, res) => { 
    const user = new User(req.body);
    
    try {
        // this user save is redundant but the instructor left it in
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken()
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/users/me', auth, async (req, res) => {
    // req.user has been discovered via auth middleware
    res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
    // define valid updates to avoid polluting with extra fields
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    // every update in updates must be part of allowedUpdates for isValidOperation to be true
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: "invalid Updates" });
    }
    
    try {
        //const user = await User.findById(req.params.id);

        updates.forEach((update) => {
            // always need to use bracket notation for getting a property dynamically
            return req.user[update] = req.body[update];
        })
        await req.user.save();
        
            // this code won't run mongoose findById method (old mongodb method)
            // new: true   
                // returns updated object, not object prior to update
            // runValidators: true
                // validates the update also
            //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

        // if (!user) {
        //     return res.status(404).send();
        // }
        res.send(req.user);
    } catch (e) {
        // ignore case where not able to connect to db for now
        // this one is for fail validation (bad request)
        res.status(400).send(e);
    }
});

router.delete('/users/me', auth, async (req,res) => {
    try {
        //const user = await User.findByIdAndDelete(req.user._id);
        // if (!user) {
        //     res.status(404).send();
        // }

        // simpler code given that we already retrieved user from auth middleware
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;