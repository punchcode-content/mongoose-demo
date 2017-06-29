const assert = require('assert');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
// Replace "test" with your database name.
mongoose.connect('mongodb://localhost:27017/test');

const Recipe = require("../models/recipe");

describe("Recipe", function () {
    beforeEach(function (done) {
        Recipe.deleteMany({}).then(() => done()).catch(done);
    });

    it("can be saved", function (done) {
        const recipe = new Recipe({name: "Pancakes"})
        recipe.save(function (err) {
            done(err);
        })
    });

    it("can be created", function (done) {
        Recipe.create({name: "Pancakes"}, function (err, recipe) {
            if (err) {
                done(err)
            } else {
                assert(recipe.id);
                assert(recipe.name == "Pancakes");
                done();
            }
        });
    });

    it("has a default value for amount on an ingredient", function (done) {
        Recipe.create({name: "Pancakes", ingredients: [{ingredient: 'egg'}]}, function (err, recipe) {
            if (err) {
                done(err)
            } else {
                assert(recipe.ingredients[0].amount == 1);
                done();
            }
        });
    });

    it("enforces required", function (done) {
        const recipe = new Recipe({source: "Grandma"});
        recipe.save(function (err) {
            if (err) return done();
            done(new Error("Should require a name"));
        })
    });

    it("enforces required using promises", function (done) {
        const recipe = new Recipe({source: "Grandma"});
        recipe.save()
        .then(function () {
            done(new Error("Should require a name"));
        })
        .catch(function (err) {
            done();
        })
    });

    it("enforces uniqueness", function (done) {
        Recipe.create({name: "Pancakes"})
        .then(function () {
            Recipe.create({name: "Pancakes"}, function (err, recipe) {
                if (err) return done();
                done(new Error("Should not allow duplicate recipe names"));                
            })
        })
    })

    it("lowercases and trims correctly", function () {
        var recipe = new Recipe({name: "Pancakes"});
        recipe.ingredients.push({ingredient: 'sugar', measure: " Tbsp"});
        assert(recipe.ingredients[0].measure == "tbsp");
        assert(recipe.ingredients[0].amount == 1);        
    })


    it("can lookup a created recipe", function (done) {
        Recipe.create({name: "Pancakes"})
            .then(function (recipe) {
                return recipe.id;
            })
            .then(function (recipeId) {
                return Recipe.findOne({ _id: recipeId });
            })
            .then(function (recipe) {
                assert(recipe.name == "Pancakes");
                done()
            })
            .catch(done)
    })
    
    it("can lookup multiple recipes", function (done) {
        Recipe.create({name: "Pancakes", cookTime: 20})
        .then(function () {
            return Recipe.create({name: "Biscuits", cookTime: 30})
        })
        .then(function () {
            return Recipe.create({name: "French Toast", cookTime: 10})
        })
        .then(function () {
            return Recipe.find({cookTime: {$gt: 15}})
        })
        .then(function (recipes) {
            assert.equal(recipes.length, 2);
            assert(recipes.some(function (recipe) { return recipe.name == "Biscuits" }));
            assert(recipes.some(function (recipe) { return recipe.name == "Pancakes" }));
            done();
        })
        .catch(done)
    })

    it("can lookup recipes by ingredients size", function (done) {
        Recipe.create({name: "Pancakes", cookTime: 20, ingredients: [{ingredient: "egg"}, {ingredient: "flour"}, {ingredient: "milk"}]})
        .then(function () {
            return Recipe.create({name: "Biscuits", cookTime: 30, ingredients: [{ingredient: "flour"}, {ingredient: "milk"}]})
        })
        .then(function () {
            return Recipe.create({name: "French Toast", cookTime: 10})
        })
        .then(function () {
            return Recipe.find({}).where({ingredients: {$lt: {$size: 3}}})
        })
        .then(function (recipes) {
            assert.equal(recipes.length, 2);
            done()
        })
        .catch(done)
    })

    it("can perform complex queries", function (done) {
        Recipe.create({name: "Pancakes", cookTime: 20, ingredients: [{ingredient: "egg"}, {ingredient: "flour"}, {ingredient: "milk"}]})
        .then(function () {
            return Recipe.create({name: "Biscuits", cookTime: 30, ingredients: [{ingredient: "flour"}, {ingredient: "milk"}]})
        })
        .then(function () {
            return Recipe.create({name: "French Toast", cookTime: 10})
        })
        .then(function () {
            return Recipe.find({})
                .where({ingredients: {$lt: {$size: 3}}})
                .sort("-cookTime")
                .select("name cookTime")
                .select("-_id")
        })
        .then(function (recipes) {
            assert.equal(recipes.length, 2);
            assert.deepEqual(recipes[0].toObject(), {name: "Biscuits", cookTime: 30});
            done()
        })
        .catch(done)
    })
})