pipeline {
    agent any

    environment {  
        WORKDIR = "/var/lib/jenkins/workspace/Paani-Wale-CI-CD" // Use Jenkins workspace
    }

    stages {
        stage('Clean Workspace') {
            steps {
                echo "🧼 Cleaning previous workspace..."
                cleanWs()
            }
        }

       stage('Clone Repository') {
          steps {
                git credentialsId: 'het-github-ssh', url: 'git@github.com:HetSolanki/Dhandha.git', branch: 'main'
              }
        }       

        stage('Prepare .env') {
            steps {
                withCredentials([file(credentialsId: 'env-file', variable: 'ENV_FILE')]) {
                    sh '''
                        cp "$ENV_FILE" "${WORKDIR}/.env.production"
                        echo ".env.production file copied to workspace:"
                        ls -la
                    '''
                }
            }
        }

        stage('Run Docker Compose') {
            steps {
                echo '🐳 Running docker-compose up...'
                dir("$WORKDIR") {
                    sh "docker-compose down || true" // stop old containers (optional)
                    sh "docker-compose up -d --build"
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successful via Docker Compose!'
        }
        failure {
            echo '❌ Deployment Failed!'
        }
    }
}
