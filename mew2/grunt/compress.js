module.exports =  {
  main: {
    options: {
      archive: '<%= brand %>.zip'
    },
    files: [
      {expand: true, dot: true, cwd: 'target/<%= brand %>/dist/', src: ['**'], dest: '<%= brand %>/src/' },
      {expand: true, dot: true, cwd: 'mew2properties/<%= brand %>/', src: ['**'], dest: '<%= brand %>/config/' }
    ]
  }
};
