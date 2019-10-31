const request = require('supertest');
const User = require('../src/models/user');
const app = require('../src/app');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Jeremi',
        email: 'jeremy.morrison37@gmail.com',
        password: 'pa$$word'
    }).expect(201);

    // Assertions about db
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about response
    expect(response.body).toMatchObject({
        user: {
            name: 'Jeremi',
            email: 'jeremy.morrison37@gmail.com'
        },
        token: user.tokens[0].token
    });
    expect(user.password).not.toBe('pa$$word');
});

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email, 
        password: userOne.password
    }).expect(200);

    const user = await User.findById(response.body.user._id);
    expect(user.tokens[1].token).toBe(response.body.token);

});

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: "fakeemail@bs.com", 
        password: "notarealpa$$w0rd"
    }).expect(400);
});

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send('')
        .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

test('Should delete account for user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(response.body._id);    
    expect(user).toBeNull();
});

test('Should not delete acct for unauth user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "Jerbuc"
        })
        .expect(200);
    const user = await User.findById(userOneId);
    expect(user.name).toEqual('Jerbuc');
});

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "Victoria"
        })
        .expect(400);
});