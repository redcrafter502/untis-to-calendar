const PrivateUntisAccessModel = (sequelize: any, Sequelize: any) => sequelize.define('privateUntisAccesses', {
    untisAccessId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'untisAccesses', key: 'untisAccessId' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    timestamps: false
})

export default PrivateUntisAccessModel