const UserSchema = {
  format: 'onetable:1.1.0',
  indexes: {
    primary: {
      hash: 'pk',
      sort: 'sk',
    },
  },
  name: 'Current',
  models: {
    Network: {
      pk: { type: String, value: 'User#${userId}' },
      sk: { type: String, value: 'Network#${chainId}' },
      userId: { type: String, required: true },
      chainId: { type: Number, required: true },
      name: { type: String, required: true },
      logo: { type: String, required: true },
      rgb: { type: String, required: true },
      rpc: { type: String, required: true },
      namespace: { type: String, required: true },
      symbol: { type: String, required: true },
      explorer: { type: String, required: true },
      isTestnet: { type: Boolean, required: true },
      created: { type: Date },
      updated: { type: Date },
    },
    User: {
      mail: {
        type: String,
        required: true,
        unique: true,
      },
      created: {
        type: Date,
      },
      sk: {
        type: String,
        value: 'User#{userId}',
        required: true,
        unique: true,
      },
      name: {
        type: String,
        required: true,
      },
      cellphone: {
        type: String,
        unique: true,
      },
      pk: {
        type: String,
        value: 'User#${username}',
        required: true,
        unique: true,
      },
      updated: {
        type: Date,
      },
      userId: {
        type: String,
        required: true,
        unique: true,
      },
      username: {
        type: String,
        required: true,
        unique: true,
      },
    },
    Keys: {
      keyArn: {
        type: String,
        required: true,
        unique: true,
      },
      address: {
        type: String,
        unique: true,
      },
      created: {
        type: Date,
      },
      sk: {
        type: String,
        value: 'Keys#${address}',
        required: false,
        unique: true,
      },
      name: {
        type: String,
        required: true,
        unique: false,
      },
      description: {
        type: String,
        nulls: true,
      },
      pk: {
        type: String,
        value: 'User#${userId}',
        required: true,
      },
      updated: {
        type: Date,
      },
      userId: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
    },
    Activity: {
      created: {
        type: Date,
      },
      sk: {
        type: String,
        value: 'Activity#${chainId}#${txHash}',
        required: true,
      },
      address: {
        type: String,
      },
      chainId: {
        type: String,
      },
      txHash: {
        type: String,
        required: true,
      },
      pk: {
        type: String,
        value: 'Address#${address}',
        required: true,
      },
      data: {
        type: String,
        required: true,
      },
      userId: {
        type: String,
        required: true,
      },
      updated: {
        type: Date,
      },
    },
    ERC20: {
      pk: { type: String, value: 'User#${userId}' },
      sk: { type: String, value: 'ERC20#${chainId}#${contractAddress}' },
      userId: { type: String, required: true },
      chainId: { type: Number, required: true },
      namespace: { type: String, required: true },
      contractAddress: { type: String, required: true },
      symbol: { type: String, required: false },
      explorer: { type: String, required: false },
      name: { type: String, required: true },
      logo: { type: String, required: false },
    },
  },
  params: {
    nulls: true,
    isoDates: true,
    timestamps: true,
    typeField: '_type',
  },
  queries: {},
  version: '1.0.0',
};

export default UserSchema;
