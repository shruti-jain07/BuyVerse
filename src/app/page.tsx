import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
export default function Home() {
  return (
    <div className="p-4">
    <div className="flex flex-col gap-y-4">
      <div>
        <Button variant="elevated">
          HELLO!BuyVerse
        </Button>
      </div>
        <div>
          <Input placeholder="I'm Input"/>
        </div>
        <div>
          <Progress value={50}/>
        </div>
        <div>
          <Textarea placeholder="I'm TextArea"/>
        </div>
        <div>
          <Checkbox/>
        </div>
      </div>
      </div>
    
  );
}
