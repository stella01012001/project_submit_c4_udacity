import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

// const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {

    constructor(
        private readonly dynamoDBClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
    ) {
    }

    async getAllTodosForUser(userId: string): Promise<TodoItem[]> {
        console.log('Getting all todos for user')

        const result = await this.dynamoDBClient
            .query({
                TableName: this.todosTable,
                IndexName: this.todosIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            })
            .promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem) {
        await this.dynamoDBClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
    }

    async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate) {
        const updtedTodo = await this.dynamoDBClient.update({
            TableName: this.todosTable,
            Key: { userId, todoId },
            ExpressionAttributeNames: { "#N": "name" },
            UpdateExpression: "set #N=:todoName, dueDate=:dueDate, done=:done",
            ExpressionAttributeValues: {
              ":todoName": updatedTodo.name,
              ":dueDate": updatedTodo.dueDate,
              ":done": updatedTodo.done
          },
          ReturnValues: "UPDATED_NEW"
        })
        .promise();
      return { Updated: updtedTodo };
    }

    // async deleteToDo(todoId: string, userId: string): Promise<string> {
    //     console.log("Deleting todo");
    //     // const params = {
    //     //     TableName: this.todosTable,
    //     //     Key: {
    //     //         "userId": userId,
    //     //         "todoId": todoId
    //     //     },
    //     // };
    //     const result = await this.dynamoDBClient.delete({ //const result = await this.docClient.delete(params).promise();
    //         TableName: this.todosTable,
    //         Key: {
    //             "userId": userId,
    //             "todoId": todoId
    //         }
    //     }).promise();
    //     console.log(result);
    //     return "" as string;
    // }

    async getTodoFromDB(todoId: string, userId: string) {
        const result = await this.dynamoDBClient.get({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();
  
        return result.Item;
    }

    async deleteToDo(todoId: string, userId: string) {
        await this.dynamoDBClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();
    }
}

// function createDynamoDBClient() {
//     if (process.env.IS_OFFLINE) {
//         console.log('Creating a local DynamoDB instance')
//         return new XAWS.DynamoDB.DocumentClient({
//             region: 'localhost',
//             endpoint: 'http://localhost:8000'
//         })
//     }

//     return new XAWS.DynamoDB.DocumentClient()
// }

