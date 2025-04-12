type CreateRecipeDto = {
    recipe_name: string;
    user_id: number;
    recipeDetails: {
        productName: string;
        qty: number;
        price: number;
        shop_id: number;
    }[];
};