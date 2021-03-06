const mongoose = require('mongoose');
const Promise = require("bluebird");
const connection = mongoose.connect('mongodb://localhost:27017/userLinks', {
  useMongoClient: true
});

var DB = {};

// Connect
mongoose.Promise = global.Promise;
mongoose.connection.once('open', () => {
  DB = mongoose.connection.db;
  console.log('\n\nWe are in business... \n');
});

const forbiddenCollections = ['users', 'sessions', 'netpost', 'dropboxImages', 'netvibesArticles', 'InstagramPosts', 'system.indexes'];
const publicCollections = ['CODING', 'GAMES', 'HACK', 'JUSTLINKS', 'TECH', 'ML', 'MEDIA', 'BITCOINS', 'WIKIPEDIA', 'GAMES'];

var removeColl = (coll) => {
  var updated = [];
  coll.forEach((collection) => {
    if (!forbiddenCollections.includes(collection.name)) {
      updated.push(collection);
    }
  })
  return updated;
}
var protectRoute = (next) => {
  var err = new Error('403 you need to authenticate yourself');
  err.status = 403;
  return next(err);
}


//
// // // // // Manage Collections
//


// List all items from all Collections
var ListAllItemsFromAllColl = (req, res, next) => {
  var aggregate = new Promise((resolved, rejected) => {
    DB.listCollections().toArray((err, doc) => {
      var collections = removeColl(doc);
      var promises = [];
      collections.forEach((collection) => {
        if (req.session.access) {
          var coll = DB.collection(collection.name);
          promises.push(coll.find().sort({ $natural: -1 }).toArray());
        } else if (publicCollections.includes(collection.name)) {
          var coll = DB.collection(collection.name);
          promises.push(coll.find().sort({ $natural: -1 }).toArray());
        }
      });
      resolved(promises);
    });
  });

  return new Promise((resolve, reject) => {
    return aggregate.then((pending) => {
      Promise.all(pending).then((data) => {
        resolve(res.json(data));
      });
    });
  });
}
// init
var ListAllColl = (req, res, next) => {
  return new Promise((resolve, reject) => {
    if (!req.session.access && !req.query.dev) return protectRoute(next);
    DB.listCollections().toArray((err, doc) => {
      if (err) return next(reject(err));
      resolve(res.json(removeColl(doc)));
    });
  });
}
// Add one !
var AddDbColl = (req, res, next) => {
  return new Promise((resolve, reject) => {
    DB.createCollection(req.body.coll).then(() => {
      DB.listCollections().toArray((err, doc) => {
        if (err) return next(reject(err));
        resolve(res.json(removeColl(doc)));
      });
    });
  });
}
// Drop one !
var DropDbColl = (req, res, next) => {
  return new Promise((resolve, reject) => {
    if (!req.session.access) return protectRoute(next);
    DB.dropCollection(req.body.coll).then((waw) => {
      DB.listCollections().toArray((err, doc) => {
        if (err) return next(reject(err));
        console.log(waw, ' => Databases still remaining: ', doc);
        resolve(res.json(removeColl(doc)));
      });
    });
  });
}
// Get one Collection and return the content of it !
var GetOneDbColl = (req, res, next) => {
  var coll = DB.collection(req.body.coll);
  return new Promise((resolve, reject) => {
    coll.find().sort({ $natural: -1 }).toArray((err, doc) => {
      if (err) return next(reject(err));
      resolve(res.json(doc));
    });
  });
}

//
// // // // // Manage content
//

var Schema = mongoose.Schema;
var itemSchema = new Schema({
  link: {
    url: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    desc: {
      type: String,
      unique: true,
      required: true,
      trim: true
    }
  },
  belongsTo: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  author: String,
  hidden: Boolean,
  canbetouch: Boolean,
  meta: {
    clicked: Number,
    beenUpdated: Boolean
  }
});

// Add one item and return the content of the updated Collection !!!
var AddItem = (req, res, next) => {
  var coll = DB.collection(req.body.item.belongsTo);
  var item = req.body.item;

  return new Promise((resolve, reject) => {
    var ModelItem = mongoose.model(req.body.item.belongsTo, itemSchema.set('collection', req.body.item.belongsTo));
    var newItem = new ModelItem(item);

    newItem.save(function (error) {
      if (error) return next(reject(error));
      coll.find().sort({ $natural: -1 }).toArray((err, doc) => {
        if (err) return next(reject(err));
        console.log('Content of the Collection updated !');
        resolve(res.json(doc));
      });
    });
  });
}
// Dell one item and return the content of the updated Collection !!!
var DelOneItem = (req, res, next) => {
  var coll = DB.collection(req.body.item.belongsTo);
  var id = req.body.item._id;
  if (!req.session.access) return protectRoute(next);
  return new Promise((resolve, reject) => {
    var ModelItem = mongoose.model(req.body.item.belongsTo, itemSchema.set('collection', req.body.item.belongsTo));

    ModelItem.remove({ _id: id }, function (error) {
      if (error) return next(reject(error));
      coll.find().sort({ $natural: -1 }).toArray((err, doc) => {
        if (err) return next(reject(err));
        console.log('Item deleted');
        resolve(res.json(doc));
      });
    });
  });
}

var UpdateItem = (req, res, next) => {
  var coll = DB.collection(req.body.item.oldCollection);
  if (!req.session.access) return protectRoute(next);
  if (req.body.item.oldCollection !== req.body.item.collectionToGo) {
    var oldId = req.body.item.id;
    var ModelItem = mongoose.model(req.body.item.oldCollection, itemSchema.set('collection', req.body.item.oldCollection));
    return new Promise((resolve, reject) => {
      ModelItem.remove({ _id: oldId }, function (badError) {
        if (badError) return next(badError);
        var newModel = mongoose.model(req.body.item.collectionToGo, itemSchema.set('collection', req.body.item.collectionToGo));
        var newItem = new newModel(req.body.item.itemToUpdate);
        newItem.save(function (error) {
          if (error) return next(reject(error));
          coll.find().sort({ $natural: -1 }).toArray((err, doc) => {
            if (err) return next(reject(err));
            console.log('Item moved !');
            resolve(res.json(doc));
          });
        });
      });
    });
  } else {
    var id = req.body.item.id
    return new Promise((resolve, reject) => {
      var ModelItem = mongoose.model(req.body.item.itemToUpdate.belongsTo, itemSchema.set('collection', req.body.item.itemToUpdate.belongsTo));
      ModelItem.update({ _id: id }, req.body.item.itemToUpdate, { multi: false }, function (error, raw) {
        if (error) return next(reject(error));
        console.log('Item updated !');
        coll.find().sort({ $natural: -1 }).toArray((err, doc) => {
          if (err) return next(reject(err));
          resolve(res.json(doc));
        });
      });
    });
  }
}

module.exports = {
  AddItem: AddItem,
  ListAllColl: ListAllColl,
  ListAllItemsFromAllColl: ListAllItemsFromAllColl,
  GetOneDbColl: GetOneDbColl,
  AddDbColl: AddDbColl,
  DropDbColl: DropDbColl,
  DelOneItem: DelOneItem,
  UpdateItem: UpdateItem
};
