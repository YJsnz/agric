package com.example.ty.operations;
import com.example.ty.auth.exception.BizException;
import com.example.ty.dashboard.repository.FarmAssetRepository;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
@Service @RequiredArgsConstructor
public class OperationService {
 private final OperationRepository records;
 private final FarmAssetRepository assets;
 public record Create(@NotBlank(message="请选择记录类型") @Size(max=24) String kind,@NotBlank(message="请填写记录标题") @Size(max=160,message="标题最多160字") String title,
  @NotBlank(message="请填写记录说明") @Size(max=2000,message="说明最多2000字") String detail,@NotBlank(message="请选择所属地块") @Size(max=40) String entityId,
  @Positive(message="数量必须大于0") Double quantity,@Size(max=20,message="单位最多20字") String unit) {}
 public record Advance(@NotBlank(message="请选择流转阶段") String stage,@NotBlank(message="请填写流转说明") @Size(max=2000,message="说明最多2000字") String detail) {}
 private String actor(){
  var attributes=org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
  if(attributes instanceof org.springframework.web.context.request.ServletRequestAttributes request && request.getRequest().getAttribute(com.example.ty.auth.security.AuthInterceptor.CURRENT_USER_ATTR) instanceof com.example.ty.auth.entity.User user)return user.getName();
  return "演示系统";
 }
 private void farm(String farmId){if(assets.findByFarmIdOrderById(farmId).isEmpty())throw BizException.notFound("基地不存在");}
 public Map<String,Object> toolContext(String farmId){
  farm(farmId);var recent=records.findTop200ByFarmIdOrderByCreatedAtDescIdDesc(farmId);
  var kinds=Map.of("BATCH","采后批次","BATCH_EVENT","批次流转事件","AGRONOMY","农事记录，不是批次","GROWTH","生长记录，不是批次","DEVICE_RECEIPT","设施模拟回执","IRRIGATION_RECEIPT","灌排模拟回执","ALERT_RECEIPT","告警处置记录");
  var stages=Map.of("HARVESTED","已采收","SORTED","已分选","STORED","已入库","DISPATCHED","已出库","RECORDED","已登记","COMPLETED","已完成");
  var batches=records.findTop10ByFarmIdAndKindOrderByCreatedAtDescIdDesc(farmId,"BATCH").stream().map(r->Map.of("id",r.getId(),"title",r.getTitle(),"stage",r.getStage(),"stageLabel",stages.get(r.getStage()),"plotId",r.getEntityId(),"quantity",r.getQuantity(),"unit",r.getUnit())).toList();
  var rows=recent.stream().limit(20).map(r->Map.of("id",r.getId(),"kind",r.getKind(),"kindLabel",kinds.getOrDefault(r.getKind(),r.getKind()),"title",r.getTitle(),"detail",r.getDetail().substring(0,Math.min(200,r.getDetail().length())),"stageLabel",stages.getOrDefault(r.getStage(),r.getStage()))).toList();
  return Map.of("simulated",true,"batches",batches,"records",rows,"limitations","采后批次只认kind=BATCH；农事和生长记录不是批次。最近10批次与20事件，长说明截取200字。完整记录与轨迹在种植模块。");
 }
 public List<OperationRecord> list(String farmId){farm(farmId);return records.findTop200ByFarmIdOrderByCreatedAtDescIdDesc(farmId);}
 @Transactional public OperationRecord create(String farmId,Create input){
  farm(farmId);var asset=assets.findByFarmIdAndId(farmId,input.entityId()).orElseThrow(()->BizException.notFound("对象不属于当前基地"));
  if(!Set.of("AGRONOMY","GROWTH","BATCH").contains(input.kind()))throw BizException.badRequest("不支持的记录类型");
  if(!Set.of("field","greenhouse").contains(asset.getType()))throw BizException.badRequest("请选择种植地块");
  if("BATCH".equals(input.kind())&&(input.quantity()==null||!Double.isFinite(input.quantity())||input.quantity()<=0||input.unit()==null||input.unit().isBlank()))throw BizException.badRequest("批次需要有效数量与单位");
  var row=records.save(OperationRecord.builder().farmId(farmId).entityId(input.entityId()).kind(input.kind()).title(input.title().trim())
   .detail(input.detail().trim()).stage("BATCH".equals(input.kind())?"HARVESTED":"RECORDED").quantity(input.quantity()).unit(input.unit())
   .operatorName(actor()).createdAt(LocalDateTime.now()).simulated(true).build());
  if("BATCH".equals(input.kind()))event(row,"HARVESTED",input.detail());return row;
 }
 @Transactional public OperationRecord advance(String farmId,Long id,Advance input){
  var row=records.findById(id).filter(r->r.getFarmId().equals(farmId)&&r.getKind().equals("BATCH")).orElseThrow(()->BizException.notFound("批次不存在"));
  var stages=List.of("HARVESTED","SORTED","STORED","DISPATCHED");int current=stages.indexOf(row.getStage());
  if(current<0||current==stages.size()-1||!stages.get(current+1).equals(input.stage()))throw BizException.badRequest("批次必须按采收、分选、入库、出库顺序处理");
  row.setStage(input.stage());records.save(row);event(row,input.stage(),input.detail());return row;
 }
 public List<OperationRecord> trace(String farmId,Long id){records.findById(id).filter(r->r.getFarmId().equals(farmId)&&r.getKind().equals("BATCH")).orElseThrow(()->BizException.notFound("批次不存在"));return records.findByFarmIdAndParentIdOrderByCreatedAtAscIdAsc(farmId,id);}
 private void event(OperationRecord parent,String stage,String detail){records.save(OperationRecord.builder().farmId(parent.getFarmId()).entityId(parent.getEntityId()).kind("BATCH_EVENT").parentId(parent.getId()).title(parent.getTitle()).detail(detail.trim()).stage(stage).operatorName(actor()).createdAt(LocalDateTime.now()).simulated(true).build());}
 public void receipt(String farmId,String entityId,String kind,String title,String detail){records.save(OperationRecord.builder().farmId(farmId).entityId(entityId).kind(kind).title(title).detail(detail).stage("COMPLETED").operatorName(actor()).createdAt(LocalDateTime.now()).simulated(true).build());}
}
