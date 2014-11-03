module.exports = {
  credentials: {
    options: {
      questions: [
        {
          config: 'RACFID',
          type: 'input',
          message: 'Is this your correct RACFID? \'Enter\' to accept',
          default: process.env.LOGNAME
        },
        {
          config: 'password',
          type: 'password',
          message: 'Type in your password (this will be saved locally in an unencrypted file).',
        }
      ]
    }
  }
};
