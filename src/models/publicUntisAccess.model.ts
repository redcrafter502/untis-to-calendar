const PublicUntisAccessModel = (sequelize: any, Sequelize: any) => sequelize.define('publicUntisAccesses', {
    untisAccessId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'untisAccesses', key: 'untisAccessId' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    classId: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    timestamps: false
})

export default PublicUntisAccessModel