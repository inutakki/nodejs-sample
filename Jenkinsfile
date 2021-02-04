pipeline {
    agent none
    environment {
        // Setting this to maven.  setEnv will not work without a build type
        // Using gitHubHost - no function in utils for the Git Hub Host
        buildType = "npm"
        gitHubHost = "github.kp.org"
        branchName = "${BRANCH_NAME}"
        triggerBmxJavaTest = false
        triggerBmxNodeTest = false
    }
    stages {
      stage('Initialization') {
        agent {label 'maven'}
        steps {
           validator();
	  sh(returnStdout: true, script: "node schemaValidtor.js");
           
         }
      }
  }
}
