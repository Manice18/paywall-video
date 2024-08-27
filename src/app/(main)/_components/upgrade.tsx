"use client";

import { Button } from "@/components/ui/button";
import { useCreateOrder } from "@/hooks/users/use-create-order";
import { useVerifyPayment } from "@/hooks/users/use-verify-order";
import { loadScript } from "@/lib/loadscript";
import { useEffect } from "react";

const Upgrade = () => {
  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();

  const verifyPayment = async (orderData: any) => {
    verifyPaymentMutation.mutate(
      {
        signature: orderData.razorpay_signature,
        orderId: orderData.razorpay_order_id,
        paymentId: orderData.razorpay_payment_id,
      },
      {
        onSuccess: () => {
          console.log("Payment verified successfully");
        },
        onError: () => {
          console.log("Error verifying payment");
        },
      }
    );
  };

  const onPayment = async () => {
    let orderData;
    createOrderMutation.mutate(
      {
        planId: "premium",
      },
      {
        onSuccess: async (data) => {
          const paymentObject = new (window as any).Razorpay({
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            order_id: data.data.id,
            ...data.data,
            handler: async function (response: any) {
              orderData = response;
              await verifyPayment(orderData);
            },
          });

          await paymentObject.open();
        },
      }
    );
  };

  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js");
  }, []);
  return (
    <Button
      variant="secondary"
      className="w-full mt-4 hover:bg-black hover:text-white transition-all duration-500"
      onClick={onPayment}
    >
      Upgrade
    </Button>
  );
};

export default Upgrade;
