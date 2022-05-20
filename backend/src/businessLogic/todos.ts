import { TodosAccess } from '../dataLayer/todosAcess'
import { TodosStorage } from '../dataLayer/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
//import { parseUserId } from '../auth/utils';
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils';

// TODO: Implement businessLogic

const todosAccess = new TodosAccess()
const todosStorage = new TodosStorage()
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export async function getAllTodosForUser(userId: string): Promise<TodoItem[]> {
    return todosAccess.getAllTodosForUser(userId)
}

export async function createTodo(
    event: APIGatewayProxyEvent, createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {

    const todoId = uuid.v4();
    const userId = getUserId(event);
    const createdAt = new Date(Date.now()).toISOString();

    const todoItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
        ...createTodoRequest
    };

    await todosAccess.createTodo(todoItem);

    return todoItem;
}

export async function updateTodo(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const newTodo = await todosAccess.updateTodo(userId, todoId, updatedTodo)
    return newTodo

}

export async function deleteToDo(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    if (!(await todosAccess.getTodoFromDB(todoId, userId))) {
        return false;
    }

    await todosAccess.deleteToDo(todoId, userId);

    return true;
}

export async function generateUploadUrl(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId

    const createSignedUrlRequest = {
        Bucket: bucketName,
        Key: todoId,
        Expires: parseInt(urlExpiration)
    }

    return todosStorage.getPresignedUploadURL(createSignedUrlRequest);
}
