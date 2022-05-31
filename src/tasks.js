const { v4 } = require("uuid");
const AWS = require("aws-sdk");
const { SlowBuffer } = require("buffer");

const dynamodb = new AWS.DynamoDB.DocumentClient();

const getTasks = async (event) => {
  try {
    const result = await dynamodb.scan({ TableName: "TaskTable" }).promise();
    return result.Items;
  } catch (err) {
    console.log(err.message);
    return {
      statusCode: 500,
      detail: "Internal Server Error",
    };
  }
};

const getTaskById = async (event) => {
  const { id } = event.pathParameters;
  const result = await dynamodb
    .get({
      TableName: "TaskTable",
      Key: {
        id,
      },
    })
    .promise();
  return result.Item;
};

const addTask = async (event) => {
  try {
    const { title, description } = JSON.parse(event.body);
    const createdAt = new Date();
    const id = v4();
    const newTask = { id, title, description, createdAt, done: false };

    await dynamodb
      .put({
        TableName: "TaskTable",
        Item: newTask,
      })
      .promise();

    return {
      statusCode: 201,
      body: JSON.stringify(newTask),
    };
  } catch (err) {
    console.log(err.message);
    return {
      statusCode: 500,
      detail: "Internal Server Error",
    };
  }
};

const updateTask = async (event) => {
  const { id } = event.pathParameters;
  const { done } = JSON.parse(event.body);
  const result = await dynamodb
    .update({
      TableName: "TaskTable",
      Key: { id },
      UpdateExpression: "set done = :done",
      ExpressionAttributeValues: {
        ":done": done,
      },
      returnValues: "ALL_NEW",
    })
    .promise();
  return {
    statusCode: 200,
    detail: "Message Updated Successfully",
  };
};

const deleteTask = async (event) => {
  const { id } = event.pathParameters;
  await dynamodb
    .delete({
      TableName: "TaskTable",
      Key: { id },
    })
    .promise();
  return {
    statusCode: 200,
    detail: "Task Deleted Successfully",
  };
};

module.exports = {
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
};
