import React, { Component } from 'react';
import Aux from 'react-aux';

import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import instanceAxios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES = {
  salad: 0.5,
  chesse: 0.4,
  meat: 1.3,
  bacon: 0.7,
  tomato: 0.6
}

class BurgerBuilder extends Component {
  state = {
    ingredients: null,
    totalPrice: 4,
    purchasable: false,
    purchasing: false,
    loading: false,
    error: false
  }

  componentDidMount() {
    instanceAxios.get('https://react-my-burger-51222.firebaseio.com/ingredients.json')
      .then(response => {
        this.setState({ ingredients: response.data })
      })
      .catch(error => {
        this.setState({ error: true })
      })
  }

  updatePurchaseState(updatedState) {
    let sum = Object.keys(updatedState)
      .map(igKey => {
        return updatedState[igKey]
      })
      .reduce((val, el) => {
        return val + el
      }, 0);

    this.setState({
      purchasable: sum > 0
    })
  }

  addIngredientHandler = (type) => {
    const oldCount = this.state.ingredients[type];
    const newCount = oldCount + 1;
    const arrIngredients = {
      ...this.state.ingredients
    };
    arrIngredients[type] = newCount;
    const oldPrice = this.state.totalPrice;
    const priceAddition = INGREDIENT_PRICES[type];
    const newPrice = oldPrice + priceAddition;
    this.setState({
      ingredients: arrIngredients,
      totalPrice: newPrice
    })
    this.updatePurchaseState(arrIngredients)
  }

  removeIngredientHandler = (type) => {
    const oldCount = this.state.ingredients[type];
    if (oldCount <= 0) {
      return
    }
    const newCount = oldCount - 1;
    const arrIngredients = {
      ...this.state.ingredients
    }
    arrIngredients[type] = newCount;
    const oldPrice = this.state.totalPrice;
    const priceDeduction = INGREDIENT_PRICES[type];
    const newPrice = oldPrice - priceDeduction;

    this.setState({
      ingredients: arrIngredients,
      totalPrice: newPrice
    })
    this.updatePurchaseState(arrIngredients)
  }

  purchaseHandler = () => {
    this.setState({ purchasing: true })
  }

  closeModalHandler = () => {
    this.setState({ purchasing: false })
  }

  orderContinueHandler = () => {
    // alert('Ordered!!!')
   
    const queryParams = [];
    for (let key in this.state.ingredients) {
      queryParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(this.state.ingredients[key]))
    }
    queryParams.push('price=' + this.state.totalPrice);
    const queryString = queryParams.join('&');


    this.props.history.push({
      pathname: '/checkout',
      search: '?' + queryString
    })
  }

  render() {
    const disabledInfo = {
      ...this.state.ingredients
    }
    for (let key in disabledInfo) {
      disabledInfo[key] = disabledInfo[key] <= 0;
    }
    let orderSummary = null;

    if (this.state.loading) {
      orderSummary = <Spinner />
    }
    let burger = this.state.error ? <p>Ingredients can not be loaded...</p> : <Spinner />

    if (this.state.ingredients) {
      burger = (
        <Aux>
          <Burger ingredients={this.state.ingredients} />
          <BuildControls
            purchasing={this.purchaseHandler}
            ingredients={this.state.ingredients}
            addIngredient={this.addIngredientHandler}
            removeIngredient={this.removeIngredientHandler}
            disabled={disabledInfo}
            price={this.state.totalPrice}
            purchasable={this.state.purchasable} />
        </Aux>
      );
      orderSummary = <OrderSummary
        closeModal={this.closeModalHandler}
        continue={this.orderContinueHandler}
        price={this.state.totalPrice}
        ingredients={this.state.ingredients} />
    }
    return (
      <Aux>
        <Modal
          closeModal={this.closeModalHandler}
          show={this.state.purchasing}>
          {orderSummary}
        </Modal>
        {burger}
      </Aux>
    );
  }
}

export default withErrorHandler(BurgerBuilder, instanceAxios);