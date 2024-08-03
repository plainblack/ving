import * as pulumi from "@pulumi/pulumi";

export const safeName = () => {
    return `${pulumi.getProject()}${pulumi.getStack()}`.toLowerCase().replace(/\s+/g, '');
}

export const prefix = (name) => {
    if (name)
        return `${pulumi.getProject()}-${pulumi.getStack()}-${name}`;
    return `${pulumi.getProject()}-${pulumi.getStack()}`;
}