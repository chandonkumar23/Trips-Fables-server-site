const express =require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6tweslj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const packageCollection = client.db("TripsDb").collection("tourType")
    const allpackageCollection = client.db("TripsDb").collection("allPackage")
    const bookingCollection = client.db("TripsDb").collection('myBookings')
    const whishlistCollection = client.db("TripsDb").collection('whishlist')
    const usersCollection = client.db("TripsDb").collection('users')
    const storyCollection = client.db("TripsDb").collection('story')



    //jwt api

    app.post('/jwt',async(req,res) =>{
      const user = req.body;
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'1h' })
        res.send({token});
    })

    //middlewers
    const verifyToken = (req,res,next) =>{
      console.log('inside verfiy token', req.headers.authorization);
      if(!req.headers.authorization){
        return res.status(401).send({message:'unauthorize access'});
      }
      const token = req.headers.authorization.split(' ')[1];
     jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
      if(err){
        return res.status(401).send({message:'forbidden access'})

      }
      req.decoded = decoded;
      next();
     })
    }
    //use verifiy admin after verifytoken

    const verifyAdmin = async (req,res,next)=>{
    const email = req.decoded.email;
    const query = {email:email};
    const user = await usersCollection.findOne(query);
    const isAdmin = user?.role == 'admin';
    if(!isAdmin){
      return res.status(403).send({message:'forbiddden access'});

    }
    next();
    }
    //users
    app.get('/users',verifyToken, async(req,res) =>{
      console.log(req.headers);
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.get ('/users/admin/:email', verifyToken,async (req , res)=>{
      const email = req.params.email;

      if( email !== req.decoded.email){
        return res.status(403).send({message: 'forbidden access'})
      }


      app.post('/users', async (req, res) => {
        const user = req.body;
        // insert email if user doesnt exists: 
        // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
        const query = { email: user.email }
        const existingUser = await usersCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
      });
      
      const query ={email: email};
      const user = await usersCollection.findOne(query)
      let admin = false;
      if(user){
        admin = user?.role === 'admin';
      }
      res.send({admin});
      
      })
      
      // admin
      
      app.patch('/users/admin/:id', async(req,res)=>{
        const id = req.params.id;
        const filter = {_id:new ObjectId(id)};
        const updatedDoc = {
          $set:{
            role:'admin'
          }
        }
        const result = await usersCollection.updateOne(filter,updatedDoc)
        res.send(result);
      })





      //alldata
  
  app.post('/all', async(req,res) =>{
        const add = req.body;
        const result = await allpackageCollection.insertOne(add);
        res.send(result)
    });


  app.get('/all', async(req,res) =>{
    const result = await allpackageCollection.find().toArray();
    res.send(result);
  })


//ture typw

    app.get('/tourType', async(req,res) =>{
        const result = await packageCollection.find().toArray();
        res.send(result);
    })





// booking api

app.post('/bookings', async(req,res) =>{
    const bookings = req.body;
    const result = await bookingCollection.insertOne(bookings);
    res.send(result)
});

app.get('/bookings/:email', async(req,res) =>{
    console.log(req.params.email);
    let params = {}
    if (req.params?.email){
        params = {email: req.params.email}
    }
    const result = await bookingCollection.find(params).toArray();
    res.send(result)
})


//whishlist

app.post('/whishlist',async(req,res)=>{
  const whishlist = req.body;
  const result = await whishlistCollection.insertOne(whishlist);
  res.send(result)
})

app.get('/whishlist/:email',async(req,res) =>{
  console.log(req.params.email);
  let params = {}
  if(req.params?.email){
    params = {email: req.params.email}
  }
  const result = await whishlistCollection.find(params).toArray();
res.send(result)
})


//story
app.post('/story',async(req,res)=>{
  const storylist = req.body;
  const result = await storyCollection.insertOne(storylist);
  res.send(result);
})

app.get('/story', async(req,res) =>{
  const result = await storyCollection.find().toArray();
  res.send(result);
})







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);



app.get('/', (req,res)=>{
    res.send('server running')

})

app.listen(port,()=>{
    console.log(`trips running on port${port}`);
})






























// const express =require('express');
// const app = express();
// const cors = require('cors');
// require('dotenv').config()
// const jwt = require('jsonwebtoken');
// const port = process.env.PORT || 5000;

// // middleware

// app.use(cors());
// app.use(express.json());


// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6tweslj.mongodb.net/?retryWrites=true&w=majority`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     // await client.connect();
    
//     const packageCollection = client.db("TripsDb").collection("tourType")
//     const allpackageCollection = client.db("TripsDb").collection("allPackage")
//     const bookingCollection = client.db("TripsDb").collection('myBookings')
//     const whishlistCollection = client.db("TripsDb").collection('whishlist')
//     const usersCollection = client.db("TripsDb").collection('users')
    


//     //jwt api
     
//     app.post('/jwt',async(req,res) =>{
//       const user = req.body;
//       const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
//         expiresIn:'1h' })
//         res.send({token});
//     })

//     //middlewers
//     const verifyToken = (req,res,next) =>{
//       console.log('inside verfiy token', req.headers.authorization);
//       if(!req.headers.authorization){
//         return res.status(401).send({message:'unauthorize access'});
//       }
//       const token = req.headers.authorization.split(' ')[1];
//      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
//       if(err){
//         return res.status(401).send({message:'forbidden access'})

//       }
//       req.decoded = decoded;
//       next();
//      })
//     }
//     //use verifiy admin after verifytoken

//     const verifyAdmin = async (req,res,next)=>{
//     const email = req.decoded.email;
//     const query = {email:email};
//     const user = await usersCollection.findOne(query);
//     const isAdmin = user?.role == 'admin';
//     if(!isAdmin){
//       return res.status(403).send({message:'forbiddden access'});

//     }
//     next();
//     }
//     //users
//     app.get('/users',verifyToken,verifyAdmin, async(req,res) =>{
//       console.log(req.headers);
//       const result = await usersCollection.find().toArray();
//       res.send(result);
//     })

//     app.get ('/users/admin/:email', verifyToken,async (req , res)=>{
//       const email = req.params.email;

//       if( email !== req.decoded.email){
//         return res.status(403).send({message: 'forbidden access'})
//       }







//       app.get('/tourType', async(req,res) =>{
//         const result = await packageCollection.find().toArray();
//         res.send(result);
//     })




//   app.get('/all', async(req,res) =>{
//     const result = await allpackageCollection.find().toArray();
//     res.send(result);
//   })
      
// // booking api

// app.post('/bookings', async(req,res) =>{
//     const bookings = req.body;
//     const result = await bookingCollection.insertOne(bookings);
//     res.send(result)
// });

// app.get('/bookings', async(req,res) =>{
//     console.log(req.query.email);
//     let query = {}
//     if (req.query?.email){
//         query = {email: req.query.email}
//     }
//     const result = await bookingCollection.find(query).toArray();
//     res.send(result)
// })


// //whishlist

// app.post('/whishlist',async(req,res)=>{
//   const whishlist = req.body;
//   const result = await whishlistCollection.insertOne(whishlist);
//   res.send(result)
// })

// app.get('/whishlist',async(req,res) =>{
//   console.log(req.query.email);
//   let query = {}
//   if(req.query?.email){
//     query = {email:req.query.email}
//   }
//   const result = await whishlistCollection.find(query).toArray();
// res.send(result)
// })
// //user info

// app.post('/users', async (req, res) => {
//   const user = req.body;
//   // insert email if user doesnt exists: 
//   // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
//   const query = { email: user.email }
//   const existingUser = await usersCollection.findOne(query);
//   if (existingUser) {
//     return res.send({ message: 'user already exists', insertedId: null })
//   }
//   const result = await usersCollection.insertOne(user);
//   res.send(result);
// });

// const query ={email: email};
// const user = await usersCollection.findOne(query)
// let admin = false;
// if(user){
//   admin = user?.role === 'admin';
// }
// res.send({admin});

// })

// // admin

// app.patch('/users/admin/:id', async(req,res)=>{
//   const id = req.params.id;
//   const filter = {_id:new ObjectId(id)};
//   const updatedDoc = {
//     $set:{
//       role:'admin'
//     }
//   }
//   const result = await usersCollection.updateOne(filter,updatedDoc)
//   res.send(result);
// })


//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
    
//   }
// }
// run().catch(console.dir);



// app.get('/', (req,res)=>{
//     res.send('server running')

// })

// app.listen(port,()=>{
//     console.log(`trips running on port${port}`);
// })