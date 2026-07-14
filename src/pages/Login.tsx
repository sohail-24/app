import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Leaf, Loader2, Mail, Phone } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clearGuestCart, getGuestCart } from "@/lib/guestCart";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = useMemo(
    () => searchParams.get("returnTo") || "/checkout",
    [searchParams],
  );
  const utils = trpc.useUtils();
  const addToCart = trpc.cart.add.useMutation();
  const requestOtp = trpc.auth.requestMobileOtp.useMutation();
  const verifyOtp = trpc.auth.verifyMobileOtp.useMutation();
  const loginEmail = trpc.auth.loginEmail.useMutation();
  const register = trpc.auth.register.useMutation();

  const [mobileNumber, setMobileNumber] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    businessName: "",
    ownerName: "",
    mobileNumber: "+91",
    email: "",
    password: "",
    businessType: "buyer" as "buyer" | "supplier" | "both",
  });
  const [error, setError] = useState<string | null>(null);

  const isPending =
    requestOtp.isPending ||
    verifyOtp.isPending ||
    loginEmail.isPending ||
    register.isPending ||
    addToCart.isPending;

  async function syncGuestCart() {
    const guestItems = getGuestCart();
    for (const item of guestItems) {
      await addToCart.mutateAsync({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes,
      });
    }
    clearGuestCart();
  }

  async function finishLogin() {
    await syncGuestCart();
    await utils.invalidate();
    navigate(returnTo, { replace: true });
  }

  async function handleMobileContinue(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      if (!otpSent) {
        await requestOtp.mutateAsync({ mobileNumber });
        setOtpSent(true);
        return;
      }

      await verifyOtp.mutateAsync({ mobileNumber, otp });
      await finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
    }
  }

  async function handleEmailContinue(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await loginEmail.mutateAsync(emailForm);
      await finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await register.mutateAsync(registerForm);
      await finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to FreshFlow</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Continue to manage checkout, orders, and your business workspace.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mobile" className="space-y-5">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="mobile">
              <form onSubmit={handleMobileContinue} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Continue with Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mobile"
                      value={mobileNumber}
                      onChange={(event) => setMobileNumber(event.target.value)}
                      className="pl-9"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      placeholder="123456"
                      required
                    />
                    {requestOtp.data?.devCode && (
                      <p className="text-xs text-muted-foreground">
                        Development OTP: {requestOtp.data.devCode}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleEmailContinue} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Continue with Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={emailForm.email}
                      onChange={(event) =>
                        setEmailForm({ ...emailForm, email: event.target.value })
                      }
                      className="pl-9"
                      placeholder="owner@business.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={emailForm.password}
                    onChange={(event) =>
                      setEmailForm({ ...emailForm, password: event.target.value })
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={registerForm.businessName}
                      onChange={(event) =>
                        setRegisterForm({
                          ...registerForm,
                          businessName: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      value={registerForm.ownerName}
                      onChange={(event) =>
                        setRegisterForm({
                          ...registerForm,
                          ownerName: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="registerMobile">Mobile Number</Label>
                    <Input
                      id="registerMobile"
                      value={registerForm.mobileNumber}
                      onChange={(event) =>
                        setRegisterForm({
                          ...registerForm,
                          mobileNumber: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="registerEmail">Email (optional)</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      value={registerForm.email}
                      onChange={(event) =>
                        setRegisterForm({
                          ...registerForm,
                          email: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      value={registerForm.password}
                      onChange={(event) =>
                        setRegisterForm({
                          ...registerForm,
                          password: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select
                      value={registerForm.businessType}
                      onValueChange={(value: "buyer" | "supplier" | "both") =>
                        setRegisterForm({
                          ...registerForm,
                          businessType: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="both">Buyer and Supplier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-destructive text-center">{error}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
