const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose').set('debug', true);
const expressjwt = require('express-jwt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//change this URL if using cloud DB like Atlas
mongoose.connect('mongodb://root:password@localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'tildb'
})

mongoose.connection.once('open', () => {
    console.log('Connected to database tildb');
})

const jwtAuth = expressjwt( {
    //this turns key into token, must explicity declare which hashing algorithm your using
    secret: 'mossypiglets-and-pangolins',
    credentialsRequired: false,
    algorithms: ['HS256']
});

app.use(jwtAuth);

app.use(cors({origin: "http://localhost:3000"}));

app.use('/graphql', graphqlHTTP({
    schema: require('./schema.js'),
    graphiql: true
}))

//only users with jwt should be able to access this page
app.use('/user', bodyParser.json(), jwtAuth, graphqlHTTP(req => ({
        schema: require('./schema.js'),
        context: {
            user: req.user
        }
    }))
)

app.use('/api', bodyParser.json(), jwtAuth, graphqlHTTP(req => ({
    schema: require('./schema.js'),
        context: {
            user: req.user
        }
    }))
)

app.listen(4005);
console.log('Running a GraphQL API server at http://localhost:4005/graphql');