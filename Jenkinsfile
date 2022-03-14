#!/usr/bin/env groovy

@Library('jenkinsPipelineUtils@main')

def utils = new com.snaptec.jenkinsPipelineUtils()
def pipeline_node_label = params.pipeline_node_label ?: 'arabioud-ec2-fleet'
def gitToken = 'github'
def project = 'arabianoud'
def site_config = [:]

site_config = utils.getSiteConfig(gitToken,"${project}")
pwa_config = utils.getPWAConfig(gitToken)

def branchIndexCause = currentBuild.getBuildCauses('jenkins.branch.BranchIndexingCause')

// work-around for yarn install issue with module workbox 
def s3_bucket_yarn = 'https://arabioud-yarnlock.s3.me-south-1.amazonaws.com'
def package_file = 'package-lock-arabioud.json'
def lock_file = 'arabioud-yarn.lock'
/* 
- cover 2 branch dev and master
- aws-ecs-task.json as task definition
- at aws-ecs-task.json define variable for GIT_COMMIT_SHORT and BUILD_ID on block define container
- ECR via jenkins ecr plugin (aws access key)
*/

if (!branchIndexCause) {

def GIT_COMMIT_SHORT = ''
node ("${pipeline_node_label}") {
    stage('checkout'){
        checkout scm
        GIT_COMMIT_SHORT = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()[0..7]
    }


try {

    stage('prepair env'){
        pwa_config."${project}".each { k,v -> 
            env."${k}"= v
            env.'GIT_COMMIT_SHORT'= "${GIT_COMMIT_SHORT}"
        }
        // setting up docker env
        sh "envsubst < ./docker/.env.docker.prod > ./docker/.env && mv ./docker/.env ./docker/.env.docker.prod"
        sh 'cat ./docker/.env.docker.prod'
    }
    
    stage('pre-build'){
        sh """ 
            wget ${s3_bucket_yarn}/${lock_file}
            mv ${lock_file} yarn.lock
        """
    }
    

if (utils.isBranch()){

    stage('build'){
        sh "docker build  -t ${project}-live:${GIT_COMMIT_SHORT}-${BUILD_NUMBER} . -f prod.dockerfile"
    }

    stage ('push ecr'){
        utils.pushECR(project, site_config.awsAccessKeyID)
    }

    stage ('deploy to ecs cluster'){
        sh " envsubst < aws-ecs-task.json > aws-ecs-task-${GIT_COMMIT_SHORT}.json"
        sh "cat aws-ecs-task-${GIT_COMMIT_SHORT}.json"
        utils.deployPWAECS (site_config.awsAccessKeyID)
    } 

    stage ('remove all docker images'){
        sh "docker rmi ${project}-live:${GIT_COMMIT_SHORT}-${BUILD_NUMBER}"
        }
    }
} finally {
        cleanWs()
        sh "docker system prune --force --all --volumes"
        }
    }
}
