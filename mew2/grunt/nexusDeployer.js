// [build zip for nexus](https://www.npmjs.org/package/grunt-nexus-deployer)
var url = 'http://ci:9090/nexus/content/repositories/releases';
module.exports = {
    mcom: {
      options: {
        groupId: 'com.macys.mobile',
        artifactId: 'mew2',
        version: '<%= version %>.<%= buildVersion %>',
        packaging: 'zip',
        auth: {
          username: process.env.NEXUS_USER,
          password: process.env.NEXUS_PASS
        },
        url: url,
        artifact: 'mcom.zip',
      }
    },
    bcom: {
      options: {
        groupId: 'com.bloomies.mobile',
        artifactId: 'mew2',
        version: '<%= version %>.<%= buildVersion %>',
        packaging: 'zip',
        auth: {
          username: process.env.NEXUS_USER,
          password: process.env.NEXUS_PASS
        },
        url: url,
        artifact: 'bcom.zip',
      }
    }
  };
