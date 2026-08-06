pipeline {
    agent any

    environment {
        DOCKER_USERNAME = "khushboo272"

        BACKEND_IMAGE = "khushboo272/airesumebuilder-backend"
        FRONTEND_IMAGE = "khushboo272/airesumebuilder-frontend"

        BUILD_TAG = "${BUILD_NUMBER}"

        K8S_NAMESPACE = "airesume"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Checking out source..."
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh """
                    docker build \
                    -t ${BACKEND_IMAGE}:latest \
                    -t ${BACKEND_IMAGE}:${BUILD_TAG} .
                    """
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh """
                    docker build \
                    -t ${FRONTEND_IMAGE}:latest \
                    -t ${FRONTEND_IMAGE}:${BUILD_TAG} .
                    """
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

                    sh '''
                    echo "$DOCKER_PASS" | docker login \
                    -u "$DOCKER_USER" \
                    --password-stdin
                    '''
                }
            }
        }

        stage('Push Backend Image') {
            steps {

                sh """
                docker push ${BACKEND_IMAGE}:latest
                docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                """

            }
        }

        stage('Push Frontend Image') {
            steps {

                sh """
                docker push ${FRONTEND_IMAGE}:latest
                docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                """

            }
        }

        stage('Deploy to Kubernetes') {
            steps {

                sh '''
                kubectl apply -f k8s-simple/namespace.yaml
                kubectl apply -f k8s-simple/configmap.yaml
                kubectl apply -f k8s-simple/secret.yaml

                kubectl apply -f k8s-simple/mongodb-deployment.yaml
                kubectl apply -f k8s-simple/mongodb-service.yaml

                kubectl apply -f k8s-simple/backend-deployment.yaml
                kubectl apply -f k8s-simple/backend-service.yaml

                kubectl apply -f k8s-simple/frontend-deployment.yaml
                kubectl apply -f k8s-simple/frontend-service.yaml
                '''
            }
        }

        stage('Verify Deployment') {
            steps {

                sh '''
                kubectl rollout status deployment/airesume-backend -n airesume
                kubectl rollout status deployment/airesume-frontend -n airesume
                '''
            }
        }

    }

    post {

        success {
            echo "Pipeline completed successfully."
        }

        failure {
            echo "Pipeline failed."
        }

        always {
            sh 'docker image prune -f || true'
        }
    }
}