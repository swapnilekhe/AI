using System.Reflection;
using Xunit;

public class OrderService{

    private readonly IDiscountCalculator        
     _discountCalculator;

     public OrderService(IDiscountCalculator discountCalculator)
     {
        _discountCalculator = discountCalculator;
     }
}

public class OrderServiceTests
{
   [Fact]
   public void Constructor_StoresDiscountCalculator()
   {
      var calculator = DispatchProxy.Create<IDiscountCalculator, CalculatorProxy>();
      var service = new OrderService(calculator);
      var field = typeof(OrderService).GetField("_discountCalculator", BindingFlags.Instance | BindingFlags.NonPublic);

      Assert.NotNull(field);
      Assert.Same(calculator, field!.GetValue(service));
   }

   public class CalculatorProxy : DispatchProxy
   {
      protected override object? Invoke(MethodInfo? targetMethod, object?[]? args) => null;
   }
}
