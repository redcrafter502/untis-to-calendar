import {Sequelize} from 'sequelize'
import pg from 'pg'

import UserModel from './user.model.js'
import UntisAccessModel from './untisAccess.model.js'
import PublicUntisAccessModel from './publicUntisAccess.model.js'
import PrivateUntisAccessModel from './privateUntisAccess.model.js'

const sslRequired = (process.env.DB_SSL_REQUIRED === 'true')

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    dialectModule: pg,
    dialectOptions: sslRequired ? {
      ssl: {
        //require: (process.env.DB_SSL_REQUIRED === 'true')
        require: true
      }
    } : {},
    pool: {
        max: parseInt(process.env.DB_POOL_MAX),
        min: parseInt(process.env.DB_POOL_MIN),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE),
        idle: parseInt(process.env.DB_POOL_IDLE)
    },
    logging: console.log,
    logQueryParameters: false
})

const db = {
    sequelize,
    Sequelize,
    user: UserModel(sequelize, Sequelize),
    untisAccess: UntisAccessModel(sequelize, Sequelize),
    publicUntisAccess: PublicUntisAccessModel(sequelize, Sequelize),
    privateUntisAccess: PrivateUntisAccessModel(sequelize, Sequelize)
}

db.user.hasMany(db.untisAccess, { foreignKey: 'userId', onDelete: 'CASCADE' })
db.untisAccess.belongsTo(db.user, { foreignKey: 'userId' })

db.untisAccess.hasOne(db.publicUntisAccess, { foreignKey: 'untisAccessId', onDelete: 'CASCADE' })
db.publicUntisAccess.belongsTo(db.untisAccess, { foreignKey: 'untisAccessId' })

db.untisAccess.hasOne(db.privateUntisAccess, { foreignKey: 'untisAccessId', onDelete: 'CASCADE' })
db.privateUntisAccess.belongsTo(db.untisAccess, { foreignKey: 'untisAccessId' })

export default db
