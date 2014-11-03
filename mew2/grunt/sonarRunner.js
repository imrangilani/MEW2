module.exports =  {
  mcom: {
    options: {
      debug: true,
      separator: '\n',
      sonar: {
        host: {
          url: 'http://11.120.149.56:9000'
        },
        jdbc: {
          url: 'jdbc:mysql://11.120.149.56:3306/sonar?useUnicode=true&amp;characterEncoding=utf8',
          username: '<%= RACFID %>',
          password: '<%= password %>'
        },

        projectKey: 'Mew2MCOM',
        projectName: 'Mew2MCOM',
        projectVersion: '0.0.1',
        sources: ['target/mcom/dev/public/scripts'].join(','),
        exclusions: [
          'compTemplates/**/*',
          'coremetrics/**/*',
          'foresee/**/*',
          'lib/**/*'
        ].join(','),
        tests: ['client/common/test/jasmine/spec', 'client/mcom/test/jasmine/spec'].join(','),
        language: 'js',
        profile: 'MEW',
        dynamicAnalysis: 'reuseReports',
        javascript: {
          jstestdriver: {
            coveragefile: 'bin/coverage/lcov/lcov.info'
          },
          lcov: {
            reportPath: 'bin/coverage/lcov/lcov.info'
          }
        },

        analysis: {
          mode: 'incremental'
        },
        issuesReport: {
          html: {
            enable: true
          }
        },
        projectDate: '9000-02-17'
      }
    }
  },
  bcom: {
    options: {
      debug: false,
      separator: '\n',
      sonar: {
        host: {
          url: 'http://11.120.149.56:9000'
        },
        jdbc: {
          url: 'jdbc:mysql://11.120.149.56:3306/sonar?useUnicode=true&amp;characterEncoding=utf8',
          username: '<%= RACFID %>',
          password: '<%= password %>'
        },

        projectKey: 'Mew2BCOMM',
        projectName: 'Mew2BCOM',
        projectVersion: '0.0.1',
        sources: ['target/bcom/dev/public/scripts'].join(','),
        exclusions: [
          'compTemplates/**/*',
          'coremetrics/**/*',
          'foresee/**/*',
          'lib/**/*'
        ].join(','),
        tests: ['client/common/test/jasmine/spec', 'client/bcom/test/jasmine/spec'].join(','),
        language: 'js',
        profile: 'MEW',
        dynamicAnalysis: 'reuseReports',
        javascript: {
          jstestdriver: {
            coveragefile: 'bin/coverage/lcov/lcov.info'
          },
          lcov: {
            reportPath: 'bin/coverage/lcov/lcov.info'
          }
        },

        analysis: {
          mode: 'incremental'
        },
        issuesReport: {
          html: {
            enable: true
          }
        },
        projectDate: '9000-02-17'
      }
    }
  }
};
