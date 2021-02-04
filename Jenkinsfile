@Library('Pipeline-shared-library') _
pipeline {
    stages {
      stage('Initialization') {
        agent {label 'unixNode'}
        steps {
           validator();
	  //sh(returnStdout: true, script: "node schemaValidtor.js");
           
         }
      }
  }
}
