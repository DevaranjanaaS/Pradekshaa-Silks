import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState, useRef } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { useNavigate } from "react-router-dom";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const navigate = useNavigate();

  const { toast } = useToast();

  function handleRatingChange(getRating) {
    //console.log(getRating, "getRating");

    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });

          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      } else {
        // Show error message from backend if available
        toast({
          title: data?.payload?.message || "Failed to add review.",
          variant: "destructive",
        });
      }
    });
  }

  function handlePolicyClick() {
    navigate("/shop/about-us#policies");
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  //console.log(reviews, "reviews");

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent
        className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:p-6 md:p-12 max-w-[98vw] sm:max-w-[90vw] lg:max-w-[70vw] overflow-y-auto"
        style={{ maxHeight: "90vh" }}
      >
        {/* Product Images Carousel */}
        <div className="relative overflow-hidden rounded-lg order-1 md:order-1">
          {productDetails?.images && productDetails.images.length > 0 ? (
            <ProductImagesCarousel images={productDetails.images} title={productDetails?.title} />
          ) : (
            <img
              src={productDetails?.image}
              alt={productDetails?.title}
              style={{ aspectRatio: "3 / 4", width: "100%", height: "auto" }}
              className="object-cover"
            />
          )}
        </div>
        {/* Product Details */}
        <div className="relative flex flex-col order-2 md:order-2">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{productDetails?.title}</h1>
          {/* Price */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
            <p
              className={`text-2xl md:text-3xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              ₹{productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 ? (
              <p className="text-xl md:text-2xl font-bold text-muted-foreground">
                ₹{productDetails?.salePrice}
              </p>
            ) : null}
          </div>
          {/* Description */}
          <p className="text-muted-foreground text-base md:text-2xl mb-4">
            {productDetails?.description}
          </p>
          {/* YouTube Video Preview */}
          {productDetails?.youtubeLink && (
            <div className="my-2 md:my-4 order-4">
              {(() => {
                function getYouTubeVideoId(url) {
                  if (!url) return null;
                  let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
                  if (match) return match[1];
                  match = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
                  if (match) return match[1];
                  match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
                  if (match) return match[1];
                  match = url.match(/shorts\/([a-zA-Z0-9_-]{11})/);
                  if (match) return match[1];
                  return null;
                }
                const videoId = getYouTubeVideoId(productDetails.youtubeLink.trim());
                if (!videoId) return null;
                const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
                return (
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={embedUrl}
                      title="YouTube video preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                );
              })()}
            </div>
          )}
          {/* Add to Cart Button */}
          <div className="mt-4 mb-2">
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full opacity-60 cursor-not-allowed">
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock
                  )
                }
              >
                Add to Cart
              </Button>
            )}
          </div>
          {/* Know our policies Button */}
          <div className="mt-2 flex justify-start pl-1">
            <Button
              variant="outline"
              className="text-xs px-8 py-2"
              onClick={handlePolicyClick}
              type="button"
            >
              Know our policies
            </Button>
          </div>
          <Separator className="my-4" />
          {/* Optionally, reviews or other content can go here */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Carousel component for product images
function ProductImagesCarousel({ images, title }) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (!images || images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [images]);

  return (
    <div className="relative">
      <img
        src={images[current]}
        alt={title}
        style={{ aspectRatio: "3 / 4", width: "100%", height: "auto" }}
        className="object-cover"
      />
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full ${idx === current ? "bg-primary" : "bg-gray-300"}`}
              style={{ display: "inline-block" }}
            ></span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductDetailsDialog;
